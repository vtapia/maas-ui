import pod from "./pod";

describe("pod selectors", () => {
  it("can get all items", () => {
    const state = {
      pod: {
        items: [{ name: "pod1" }],
      },
    };
    expect(pod.all(state)).toEqual([{ name: "pod1" }]);
  });

  it("can get the loading state", () => {
    const state = {
      pod: {
        loading: true,
        items: [],
      },
    };
    expect(pod.loading(state)).toEqual(true);
  });

  it("can get the loaded state", () => {
    const state = {
      pod: {
        loaded: true,
        items: [],
      },
    };
    expect(pod.loaded(state)).toEqual(true);
  });

  it("can get the saving state", () => {
    const state = {
      pod: {
        saving: true,
        items: [],
      },
    };
    expect(pod.saving(state)).toEqual(true);
  });

  it("can get the saved state", () => {
    const state = {
      pod: {
        saved: true,
        items: [],
      },
    };
    expect(pod.saved(state)).toEqual(true);
  });

  it("can get the errors state", () => {
    const state = {
      pod: {
        errors: "Data is incorrect",
      },
    };
    expect(pod.errors(state)).toStrictEqual("Data is incorrect");
  });

  it("can get a pod by id", () => {
    const state = {
      pod: {
        items: [
          { name: "pod-1", id: 111 },
          { name: "podrick", id: 222 },
        ],
      },
    };
    expect(pod.getById(state, 222)).toStrictEqual({
      name: "podrick",
      id: 222,
    });
    expect(pod.getById(state, "222")).toStrictEqual({
      name: "podrick",
      id: 222,
    });
  });
});
