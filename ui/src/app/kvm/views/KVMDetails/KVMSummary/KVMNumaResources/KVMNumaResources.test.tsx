import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import KVMNumaResources, { TRUNCATION_POINT } from "./KVMNumaResources";

import * as hooks from "app/base/hooks";
import {
  config as configFactory,
  configState as configStateFactory,
  machine as machineFactory,
  machineState as machineStateFactory,
  pod as podFactory,
  podNumaNode as podNumaNodeFactory,
  podState as podStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("KVMNumaResources", () => {
  it("can expand truncated NUMA nodes if above truncation point", () => {
    const pod = podFactory({
      id: 1,
      numa_pinning: Array.from(Array(TRUNCATION_POINT + 1)).map(() =>
        podNumaNodeFactory()
      ),
    });
    const state = rootStateFactory({ pod: podStateFactory({ items: [pod] }) });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <KVMNumaResources id={pod.id} />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("Button[data-test='show-more-numas']").exists()).toBe(
      true
    );
    expect(wrapper.find("PodResourcesCard").length).toBe(TRUNCATION_POINT);

    act(() => {
      wrapper.find("Button[data-test='show-more-numas']").simulate("click");
    });
    wrapper.update();

    expect(
      wrapper.find("Button[data-test='show-more-numas'] span").text()
    ).toBe("Show less NUMA nodes");
    expect(wrapper.find("PodResourcesCard").length).toBe(
      pod.numa_pinning?.length
    );
  });

  it("shows wide cards if the pod has less than or equal to 2 NUMA nodes", () => {
    const pod = podFactory({
      id: 1,
      numa_pinning: [podNumaNodeFactory()],
    });
    const state = rootStateFactory({ pod: podStateFactory({ items: [pod] }) });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <KVMNumaResources id={pod.id} />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find(".numa-resources-grid.is-wide").exists()).toBe(true);
    expect(wrapper.find("PodResourcesCard").length).toBe(1);
    expect(
      wrapper
        .find("PodResourcesCard")
        .prop("className")
        .includes("pod-resources-card--wide")
    ).toBe(true);
  });

  it("can send an analytics event when expanding NUMA nodes if analytics enabled", () => {
    const pod = podFactory({
      id: 1,
      numa_pinning: Array.from(Array(TRUNCATION_POINT + 1)).map(() =>
        podNumaNodeFactory()
      ),
    });
    const state = rootStateFactory({
      config: configStateFactory({
        items: [
          configFactory({
            name: "enable_analytics",
            value: false,
          }),
        ],
      }),
      pod: podStateFactory({ items: [pod] }),
    });
    const mockSendAnalytics = jest.fn();
    const mockUseSendAnalytics = (hooks.useSendAnalytics = jest.fn(
      () => mockSendAnalytics
    ));

    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <KVMNumaResources id={pod.id} />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      wrapper.find("Button[data-test='show-more-numas']").simulate("click");
    });
    wrapper.update();

    expect(mockSendAnalytics).toHaveBeenCalled();
    expect(mockSendAnalytics.mock.calls[0]).toEqual([
      "KVM details",
      "Toggle expanded NUMA nodes",
      "Show more NUMA nodes",
    ]);

    mockUseSendAnalytics.mockRestore();
  });

  it("correctly filters VMs dropdown to those that belong to each NUMA node", () => {
    const podID = 1;
    const podName = "pod";
    const machines = [
      machineFactory({ pod: { id: podID, name: podName } }),
      machineFactory({ pod: { id: podID, name: podName } }),
    ];
    const pod = podFactory({
      id: podID,
      name: podName,
      numa_pinning: [
        podNumaNodeFactory({
          vms: [
            {
              networks: {
                guest_nic_id: 0,
                host_nic_id: 0,
              },
              pinned_cores: [],
              system_id: machines[0].system_id,
            },
          ],
        }),
        podNumaNodeFactory({
          vms: [
            {
              networks: {
                guest_nic_id: 1,
                host_nic_id: 1,
              },
              pinned_cores: [],
              system_id: machines[1].system_id,
            },
          ],
        }),
      ],
    });
    const state = rootStateFactory({
      machine: machineStateFactory({ items: machines }),
      pod: podStateFactory({ items: [pod] }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <KVMNumaResources id={pod.id} />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("PodResourcesCard").at(0).prop("vms")).toStrictEqual([
      machines[0],
    ]);
    expect(wrapper.find("PodResourcesCard").at(1).prop("vms")).toStrictEqual([
      machines[1],
    ]);
  });
});
