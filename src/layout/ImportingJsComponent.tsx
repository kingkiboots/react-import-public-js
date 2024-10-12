import React, { useLayoutEffect, useState } from "react";
import { useScript } from "../hooks/common/ScriptHook";

const ImportingJsComponent = () => {
  const { status, isReady, isError, isLoading, importScriptAsync } =
    useScript();
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((prev) => prev + 1);
  };

  useLayoutEffect(() => {
    importScriptAsync("js/theme");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);
  console.log("status", status);
  console.log("isReady", isReady);
  console.log("isError", isError);
  console.log("isLoading", isLoading);

  return <button onClick={handleClick}>count : {count}</button>;
};

export default ImportingJsComponent;
