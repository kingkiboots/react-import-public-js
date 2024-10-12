import { useCallback, useLayoutEffect, useMemo, useState } from "react";

type ScriptStatus = "idle" | "loading" | "ready" | "error";
type ScriptStatusObject = {
  el: HTMLScriptElement;
  status: ScriptStatus;
};
type ScriptProps = Omit<
  React.DetailedHTMLProps<
    React.ScriptHTMLAttributes<HTMLScriptElement>,
    HTMLScriptElement
  >,
  "src" | "async"
> & {
  src: string;
  onLoad?: (evt: Event) => void;
  onError?: (evt: Event) => void;
  [key: string]: any; // 추가적인 속성을 허용
};

export const useScript = (basePath = "assets/", charset?: string) => {
  const [scriptStatus, setScriptStatus] = useState<ScriptStatusObject[]>([]);
  /*
   * 모든 스크립트의 로딩 상태
   */
  const status = useMemo(
    () =>
      scriptStatus.reduce((acc, cur) => {
        acc.set(cur.el.src, cur.status);
        return acc;
      }, new Map<string, ScriptStatus>()),
    [scriptStatus]
  );
  /*
   * 스크립트들 중에 error가 난게 있는지
   */
  const isError = useMemo(
    () =>
      scriptStatus.length > 0 && scriptStatus.some((e) => e.status === "error"),
    [scriptStatus]
  );
  /*
   * 스크립트들 중 로딩 중인게 있는지
   */
  const isLoading = useMemo(
    () =>
      scriptStatus.length > 0 &&
      scriptStatus.some((e) => e.status === "loading"),
    [scriptStatus]
  );
  /*
   * 모든 스크립트가 로드되었는지
   */
  const isReady = useMemo(
    () =>
      scriptStatus.length > 0 &&
      scriptStatus.every((e) => e.status === "ready"),
    [scriptStatus]
  );
  /*
   * body에서 중복된 src의 스크립트 태그를 지우는 함수
   */
  const removeDuplicateScript = useCallback((src: string) => {
    const existingScript = document.body.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      // (existingScript.parentNode ?? document.body).removeChild(existingScript);
      existingScript.remove();
    }
  }, []);
  /*
   * src와 그 외 속성을 받아 script 태그를 생성하고 반환하는 함수
   */
  const createScript = useCallback(
    (
      src: string,
      additionalProps: Partial<ScriptProps> = {}
    ): HTMLScriptElement => {
      removeDuplicateScript(src); // 스크립트 태그 생성
      const script = document.createElement("script");
      const { onLoad, onError, async, ...restProps } = additionalProps;
      script.src = src;
      if (charset) {
        script.charset = charset;
      }
      script.async = async ?? true;
      script.setAttribute("data-status", "loading"); // 스크립트 태그에 event listener 추가
      script.addEventListener("load", (evt) => {
        onLoad?.(evt);
        script.setAttribute("data-status", "ready");
        updateScriptStatus(script, "ready"); // notifySubscribers(src, { el: script, status: "ready" });
      });
      script.addEventListener("error", (evt) => {
        onError?.(evt);
        script.setAttribute("data-status", "error");
        updateScriptStatus(script, "error"); // notifySubscribers(src, { el: script, status: "error" });
        console.error("Error On Importing JS File ::::", evt);
      }); // 추가 속성 설정
      Object.entries(restProps).forEach(([key, value]) => {
        if (value !== undefined) {
          script.setAttribute(key, value);
        }
      });
      return script;
    },
    [removeDuplicateScript, charset]
  );
  /*
   * 스크립트와 로딩 상태를 받아 setScriptStatus 하는 함수
   */
  const updateScriptStatus = useCallback(
    (script: HTMLScriptElement, status: ScriptStatus) => {
      setScriptStatus((prev) =>
        prev.map((item) => (item.el === script ? { ...item, status } : item))
      );
    },
    []
  );
  /*
   * src를 받아 스크립트 태그를 생성하고 이를 document.body에 append 하는 함수
   */
  const createAndLoadScript = useCallback(
    (src: string, additionalProps: Partial<ScriptProps> = {}) => {
      // 스크립트 태그 생성
      const script = createScript(src, additionalProps); // html body에 script 태그를 추가 및 해당 스크립트 파일 읽어들이기 시작
      document.body.appendChild(script);
      setScriptStatus((prev) => [
        // appendedScripts 배열에서 중복된 스크립트를 제거한 새로운 배열을 반환
        ...prev.filter((script) => script.el.src !== src),
        { el: script, status: "loading" },
      ]); // notifySubscribers(src, { el: script, status: "loading" });
    },
    [createScript /*, appendedScripts */]
  );
  /**
   * 비동기로 스크립트를 불러오고 실행하는 함수
   * 비동기이므로 스크립트를 불러오는 동안에 브라우저가 느려지지 않는다는 장점이 있다.
   * 하지만 여러개의 스크립트를 불러오고, 스크립트를 불러오는 순서가 중요하다면 좋지 못하다.
   * 불러와야할 스크립트가 하나일 경우나 여러 스크립트를 불러오는 순서가 상관 없다면 가급적 이 함수를 사용하도록 하자
   */
  const importScriptAsync = useCallback(
    (...args: (string | ScriptProps)[]) => {
      // 순수 자바 스크립트 파일을 불러오는 함수
      for (const arg of args) {
        let jsSrc = basePath;
        if (typeof arg === "string") {
          jsSrc += arg;
          createAndLoadScript(jsSrc, { async: true });
        } else {
          // 특정 속성을 가진 자바 스크립트 파일을 불러오는 함수
          const { src, ...restProps } = arg;
          jsSrc += src;
          createAndLoadScript(jsSrc, { ...restProps, async: true });
        }
      }
    },
    [basePath, createAndLoadScript]
  );
  /**
   * 동기로 스크립트를 불러오고 실행하는 함수
   * 동기이므로 만일 불러오는 스크립트의 양이 클 경우 브라우저에 영향을 줄 수 있다.
   * 하지만 여러개의 스크립트를 불러오고, 스크립트를 불러오는 순서가 중요하다면 이 방식이 더 안전하다.
   */
  const importScript = useCallback(
    (...args: (string | ScriptProps)[]) => {
      for (const arg of args) {
        // 순수 자바 스크립트 파일을 불러오는 함수
        if (typeof arg === "string") {
          const jsSrc = basePath + arg;
          createAndLoadScript(jsSrc, { async: false });
        } else {
          // 특정 속성을 가진 자바 스크립트 파일을 불러오는 함수
          const { src, ...restProps } = arg;
          const jsSrc = basePath + src;
          createAndLoadScript(jsSrc, { ...restProps, async: false });
        }
      }
    },
    [basePath, createAndLoadScript]
  ); // *** 다만 프로젝트마다 불러들인 script 태그를 지워야할 시점과 이 hook이 unmount 될 때에 실행할 액션이 다를 수도 있므로 참고만 하시기 바랍니다.
  useLayoutEffect(() => {
    return () => {
      scriptStatus.forEach((script) => {
        console.debug("script to be removed::", script); // document.body.removeChild(script.el);
        script.el.remove();
      });
    };
  }, []);
  return {
    status,
    isError,
    isLoading,
    isReady,
    importScript,
    importScriptAsync,
  };
};
