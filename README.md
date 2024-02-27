# [React JS] React 컴포넌트에서 외부 script 를 다시 불러오기

- public/assets/js/ 폴더 내에 있는 js 파일을 특정 조건 발생 시 다시 import 해오려고한다.
- helmet 등의 여러 방법이 있지만 아래의 코드처럼 <script></script> 방식으로 import 하려한다.

```html
<script src="assets/js/main.js"></script>
```

- 참고
  - html: /public/index.html
  - custom hook: /src/hooks/common/ScriptHook.ts
  - component: /src/layout/ImportingJsComponent.tsx

> 블로그 링크 : [https://wheatbeingdeep-codinggiliee.tistory.com/14]
