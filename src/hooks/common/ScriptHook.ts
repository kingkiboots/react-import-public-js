import { useCallback, useLayoutEffect, useState } from "react";

type ScriptStatus = "idle" | "loading" | "ready" | "error";

const JS_IMPORT_BASE_PATH = "assets/";

export const useScript = (basePath = JS_IMPORT_BASE_PATH) => {
  // 스크립트 파일을 불러오는 상태
  const [status, setStatus] = useState<ScriptStatus>("idle");

  // public에 있는 순수 자바 스크립트 파일을 불러오는 함수
  const loadScript = useCallback(
    (src: string) => {
      const existingScript = document.querySelector(`script[src="${src}"]`);

      // 불러올 자바스크립트 파일을 불러오는 script 태그가 이미 존재한다면 삭제한다.
      // 중복된 요소를 여러개 불러오면 가독성 해치고 프로그램도 무거워질 것이므로.
      if (existingScript) {
        const existingStatus = existingScript.getAttribute("data-status");

        document.body.removeChild(existingScript);
        if (existingStatus) {
          // setStatus(existingStatus as ScriptStatus);
          // return existingScript as HTMLScriptElement;
        }
      }

      // 스크립트 태그 생성
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      // data-status 를 loading으로
      script.setAttribute("data-status", "loading");

      // 스크립트 태그에 event listener 추가
      // javascript 파일을 모두 읽어들였을 시 data-status 를 ready로
      script.addEventListener("load", () => {
        script.setAttribute("data-status", "ready");
        setStatus("ready");
      });
      // // javascript 파일을 읽어들이는 중 오류 발생 시 data-status 를 error로
      script.addEventListener("error", () => {
        script.setAttribute("data-status", "error");
        setStatus("error");
      });

      // html.body에 script 태그를 추가 및 해당 스크립트 파일 읽어들이기 시작
      document.body.appendChild(script);
    },
    [setStatus]
  );

  // 리액트 컴포넌트에서 호출하여 인자로 들어온 javascript 파일을 불러오는 함수
  const importScript = useCallback(
    (...jsSrc: string[]) => {
      const scripts = jsSrc.map((js) => `${basePath}${js}.js`);
      scripts.forEach(loadScript);
    },
    [loadScript, basePath]
  );

  // 이 훅이 unmount 될 때에, 주로 이 훅을 사용하고 있는 컴포넌트가 unmount 될 때에, 그러니까 화면이 전환될 때에
  // 'script[data-status="loading"], script[data-status="ready"], script[data-status="error"]'로 되어있는 태그는
  // 여기서 만들어진 것이기 때문에 지워준다.
  // *** 다만 프로젝트마다 불러들인 script 태그를 지워야할 시점과 이 hook이 unmount 될 때에 실행할 액션이 다를 수도 있므로 참고만 하시기 바랍니다.
  useLayoutEffect(() => {
    return () => {
      const scriptElements = document.querySelectorAll(
        'script[data-status="loading"], script[data-status="ready"], script[data-status="error"]'
      );
      scriptElements.forEach((script) => {
        document.body.removeChild(script);
      });
    };
  }, []);

  // 종종 리액트 컴포넌트 내에서 여기에 src로 들어온 javascript 파일을 다 불러온 다음에
  // 무언가 이벤트를 실행하도록 해야하는 경우도 있으므로 status도 함께 return 시켜준다.
  return { status, importScript };
};
