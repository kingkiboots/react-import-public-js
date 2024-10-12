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

### 버전

#### 0.1.1

1. 스크립트 상태 관리 개선

- `ScriptStatusObject` 배열을 사용하여 각 스크립트의 상태를 개별적으로 추적
- `status`는 단순한 로딩 상태뿐만 아니라 추가된 스크립트 태그와 로딩 상태를 배열로 반환

```typescript
type ScriptStatus = "idle" | "loading" | "ready" | "error";
type ScriptStatusObject = {
  el: HTMLScriptElement;
  status: ScriptStatus;
};
```

2. 비동기 및 동기 로딩 지원

- `importScriptAsync`와 `importScript` 두 가지 함수 제공
- 비동기 로딩:
  - 장점: 스크립트 로딩 중 브라우저 성능 유지
  - 단점: 여러 스크립트의 로딩 순서가 중요한 경우 안전하지 않음
- 동기 로딩:
  - 장점: 스크립트 로딩 순서 보장
  - 단점: 대용량 스크립트 로딩 시 브라우저 성능에 영향 가능
- **권장사항**:
  - 단일 스크립트 로딩이나 로딩 순서가 중요하지 않은 경우 `importScriptAsync` 사용

3. \<script\> 의 추가 속성 지원

- `importScript(Async)` 함수 파라미터 타입 확장: `...args: (string | ScriptProps)[] `
- 스크립트 src뿐만 아니라 `\<script\>` 태그의 속성과 콜백 함수 전달 가능
  - 스크립트가 완전히 불러오거나 불러오는 중 에러가 발생했을 때의 실행할 콜백함수 속성 추가(`onLoad`, `onError`)

4. 편리한 상태 확인 기능

- isError, isLoading, isReady 등의 편의 프로퍼티 제공

<hr/>

1. Enhanced Script Status Management

- Uses an array of `ScriptStatusObject` to track each script's status individually
- `status` returns an array of added script tags and their loading states, not just a simple loading status

```typescript
type ScriptStatus = "idle" | "loading" | "ready" | "error";
type ScriptStatusObject = {
  el: HTMLScriptElement;
  status: ScriptStatus;
};
```

2. Support for Asynchronous and Synchronous Loading

- Provides two functions: `importScriptAsync` and `importScript`
- Asynchronous loading:
  - Pro: Maintains browser performance during script loading
  - Con: May be unsafe when loading order of multiple scripts is crucial
- Synchronous loading:
  - Pro: Guarantees script loading order
  - Con: May impact browser performance when loading large scripts
- **Recommendation**:
  - Use `importScriptAsync` for single script loading or when loading order is not important

3. Support for Additional `\<script\>` Tag Attributes

- `importScript(Async)` function parameter type: `...args: (string | ScriptProps)[]`
- Allows passing not only script src but also `\<script\>` tag attributes and callback functions
- New callback functions: `onLoad`, `onError`

4. Convenient Status Check Features

- Provides convenience properties such as `isError`, `isLoading`, `isReady`
