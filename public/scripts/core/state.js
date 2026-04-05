export function createStore(initialState) {
  let state = initialState;

  return {
    getState() {
      return state;
    },
    setState(updater) {
      state = typeof updater === "function" ? updater(state) : updater;
      return state;
    },
  };
}
