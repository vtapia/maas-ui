import type { TSFixMe } from "app/base/types";
import type { Model } from "app/store/types/model";
import type { GenericState } from "app/store/types/state";

export type ScriptsHistory = Model & {
  comment: string | null;
  created: string;
  data: string;
};

export type ScriptsPackages = {
  [x: string]: string[];
};

export type ScriptsParameters = {
  // Data from a Django JSONObjectField that could have any validly parsed JSON structure.
  [x: string]: TSFixMe;
};

export type ScriptsResults = {
  // Data from a Django JSONObjectField that could have any validly parsed JSON structure.
  [x: string]: TSFixMe;
};

export type Scripts = Model & {
  apply_configured_networking: boolean;
  default: boolean;
  description: string;
  destructive: boolean;
  for_hardware: string[];
  hardware_type_name: "Node" | "CPU" | "Memory" | "Storage" | "Network";
  hardware_type: number;
  history: ScriptsHistory[];
  may_reboot: boolean;
  name: string;
  packages: ScriptsPackages;
  parallel_name:
    | "Disabled"
    | "Run along other instances of this script"
    | "Run along any other script.";
  parallel: number;
  parameters: ScriptsParameters;
  recommission: boolean;
  resource_uri: string;
  results: ScriptsResults;
  tags: string[];
  timeout: string;
  title: string;
  type_name: "Commissioning script" | "Testing script";
  type: number;
};

export type ScriptsState = GenericState<Scripts, TSFixMe>;
