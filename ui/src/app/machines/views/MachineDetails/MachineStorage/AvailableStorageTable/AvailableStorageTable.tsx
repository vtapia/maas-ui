import { useEffect, useState } from "react";

import { Input, MainTable } from "@canonical/react-components";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";

import ActionConfirm from "../ActionConfirm";
import BootStatus from "../BootStatus";
import NumaNodes from "../NumaNodes";
import TagLinks from "../TagLinks";
import TestStatus from "../TestStatus";

import AddLogicalVolume from "./AddLogicalVolume";
import AddPartition from "./AddPartition";
import BulkActions from "./BulkActions";
import EditLogicalVolume from "./EditLogicalVolume";
import EditPartition from "./EditPartition";

import DoubleRow from "app/base/components/DoubleRow";
import TableMenu from "app/base/components/TableMenu";
import type { TSFixMe } from "app/base/types";
import { actions as machineActions } from "app/store/machine";
import machineSelectors from "app/store/machine/selectors";
import type { Disk, Machine, Partition } from "app/store/machine/types";
import {
  canBeDeleted,
  canBePartitioned,
  canCreateLogicalVolume,
  diskAvailable,
  formatSize,
  formatType,
  getDiskById,
  getPartitionById,
  isDatastore,
  isDisk,
  isLogicalVolume,
  isPartition,
  isVolumeGroup,
  partitionAvailable,
} from "app/store/machine/utils";
import type { RootState } from "app/store/root/types";

// Actions that are performed on multiple devices at once
export type BulkAction = "createVolumeGroup" | "createRaid";

// Actions that are performed on a single device
type Expanded = {
  content:
    | "createLogicalVolume"
    | "createPartition"
    | "deleteDisk"
    | "deletePartition"
    | "deleteVolumeGroup"
    | "editLogicalVolume"
    | "editPartition";
  id: string;
};

type Props = {
  canEditStorage: boolean;
  systemId: Machine["system_id"];
};

/**
 * Generate a unique ID for a disk or partition. Since both disks and partitions
 * are used in the table it's possible for the id number alone to be non-unique.
 * @param storageDevice - the disk or partition to create a unique ID for.
 * @returns unique ID for the disk or partition
 */
export const uniqueId = (storageDevice: Disk | Partition): string =>
  `${storageDevice.type}-${storageDevice.id}`;

/**
 * Returns whether a storage device is available.
 * @param storageDevice - the disk or partition to check.
 * @returns whether a storage device is available.
 */
const isAvailable = (storageDevice: Disk | Partition) => {
  if (isDatastore(storageDevice.filesystem)) {
    return false;
  }

  if (isDisk(storageDevice)) {
    return diskAvailable(storageDevice);
  }
  return partitionAvailable(storageDevice);
};

/**
 * Returns whether a storage device is currently in selected state.
 * @param storageDevice - the disk or partition to check.
 * @param selected - list of currently selected storage devices.
 * @returns whether a storage device is selected.
 */
const isSelected = (
  storageDevice: Disk | Partition,
  selected: (Disk | Partition)[]
) =>
  selected.some(
    (item) => item.id === storageDevice.id && item.type === storageDevice.type
  );

/**
 * Generate the actions that a given disk can perform.
 * @param disk - the disk to check.
 * @param setExpanded - function to set the expanded table row and content.
 * @returns list of action links.
 */
const getDiskActions = (
  disk: Disk,
  setExpanded: (expanded: Expanded | null) => void
) => {
  const actions = [];
  const actionGenerator = (label: string, content: Expanded["content"]) => ({
    children: label,
    "data-test": content,
    onClick: () => setExpanded({ content, id: uniqueId(disk) }),
  });

  if (canBePartitioned(disk)) {
    actions.push(actionGenerator("Add partition...", "createPartition"));
  }

  if (canCreateLogicalVolume(disk)) {
    actions.push(
      actionGenerator("Add logical volume...", "createLogicalVolume")
    );
  }

  if (isLogicalVolume(disk)) {
    actions.push(
      actionGenerator("Edit logical volume...", "editLogicalVolume")
    );
  }

  if (canBeDeleted(disk)) {
    if (isVolumeGroup(disk)) {
      actions.push(
        actionGenerator("Remove volume group...", "deleteVolumeGroup")
      );
    } else {
      actions.push(
        actionGenerator(`Remove ${formatType(disk, true)}...`, "deleteDisk")
      );
    }
  }
  return actions;
};

/**
 * Normalise rendered row data so that both disks and partitions can be displayed.
 * @param storageDevice - the disk or partition to normalise.
 * @param actionsDisabled - whether actions should be disabled.
 * @param expanded - the currently expanded row and content.
 * @param selected - the currently selected storage devices.
 * @param handleRowCheckbox - row checkbox handler function.
 * @param actions - list of actions the storage device can perform.
 * @returns normalised row data
 */
const normaliseRowData = (
  storageDevice: Disk | Partition,
  actionsDisabled: boolean,
  expanded: Expanded | null,
  selected: (Disk | Partition)[],
  handleRowCheckbox: (storageDevice: Disk | Partition) => void,
  actions: TSFixMe[] // Replace TSFixMe with TableMenu actions type when converted to TS
) => {
  const rowId = uniqueId(storageDevice);
  const isExpanded = expanded?.id === rowId && Boolean(expanded?.content);

  return {
    className: isExpanded ? "p-table__row is-active" : null,
    columns: [
      {
        content: (
          <DoubleRow
            primary={
              <Input
                checked={isSelected(storageDevice, selected)}
                className="has-inline-label keep-label-opacity"
                data-test={`checkbox-${rowId}`}
                disabled={actionsDisabled}
                id={rowId}
                label={storageDevice.name}
                onChange={() => handleRowCheckbox(storageDevice)}
                type="checkbox"
                wrapperClassName="u-no-margin--bottom u-nudge--checkbox"
              />
            }
            secondary={"serial" in storageDevice && storageDevice.serial}
            secondaryClassName="u-nudge--secondary-row"
          />
        ),
      },
      {
        content: (
          <DoubleRow
            primary={"model" in storageDevice ? storageDevice.model : "—"}
            secondary={
              "firmware_version" in storageDevice &&
              storageDevice.firmware_version
            }
          />
        ),
      },
      {
        className: "u-align--center",
        content: (
          <DoubleRow
            primary={
              "is_boot" in storageDevice ? (
                <BootStatus disk={storageDevice} />
              ) : (
                "—"
              )
            }
          />
        ),
      },
      {
        content: <DoubleRow primary={formatSize(storageDevice.size)} />,
      },
      {
        content: (
          <DoubleRow
            primary={formatType(storageDevice)}
            secondary={
              ("numa_node" in storageDevice ||
                "numa_nodes" in storageDevice) && (
                <NumaNodes disk={storageDevice} />
              )
            }
          />
        ),
      },
      {
        content: (
          <DoubleRow
            primary={
              "test_status" in storageDevice ? (
                <TestStatus testStatus={storageDevice.test_status} />
              ) : (
                "—"
              )
            }
            secondary={<TagLinks tags={storageDevice.tags} />}
          />
        ),
      },
      {
        className: "u-align--right",
        content: (
          <TableMenu
            disabled={actionsDisabled || actions.length === 0}
            links={actions}
            position="right"
            title="Take action:"
          />
        ),
      },
    ],
    expanded: isExpanded,
    key: rowId,
  };
};

const AvailableStorageTable = ({
  canEditStorage,
  systemId,
}: Props): JSX.Element | null => {
  const dispatch = useDispatch();
  const machine = useSelector((state: RootState) =>
    machineSelectors.getById(state, systemId)
  );
  const [expanded, setExpanded] = useState<Expanded | null>(null);
  const [selected, setSelected] = useState<(Disk | Partition)[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);

  const closeExpanded = () => setExpanded(null);
  const handleRowCheckbox = (storageDevice: Disk | Partition) => {
    const newSelected = isSelected(storageDevice, selected)
      ? selected.filter((item) => item !== storageDevice)
      : [...selected, storageDevice];
    setSelected(newSelected);
  };
  const handleAllCheckbox = () => {
    if (machine && "disks" in machine) {
      if (selected.length) {
        setSelected([]);
      } else {
        const newSelected = machine.disks.reduce<(Disk | Partition)[]>(
          (selected, disk) => {
            if (isAvailable(disk)) {
              selected.push(disk);
            }
            if (disk.partitions) {
              disk.partitions.forEach((partition) => {
                if (isAvailable(partition)) {
                  selected.push(partition);
                }
              });
            }
            return selected;
          },
          []
        );
        setSelected(newSelected);
      }
    }
  };
  const actionsDisabled = !canEditStorage || Boolean(bulkAction);

  // To prevent selected state from becoming stale, set it directly from the
  // machine object when it changes (e.g. when a disk is deleted or updated).
  useEffect(() => {
    if (machine && "disks" in machine) {
      setSelected((prevSelected) => {
        const newSelected = [];
        for (const item of prevSelected) {
          if (isPartition(item)) {
            const partition = getPartitionById(machine.disks, item.id);
            if (partition && isAvailable(partition)) {
              newSelected.push(partition);
            }
          } else {
            const disk = getDiskById(machine.disks, item.id);
            if (disk && isAvailable(disk)) {
              newSelected.push(disk);
            }
          }
        }
        return newSelected;
      });
    }
  }, [machine]);

  if (machine && "disks" in machine && "supported_filesystems" in machine) {
    const rows: TSFixMe[] = [];

    machine.disks.forEach((disk) => {
      if (isAvailable(disk)) {
        const diskActions = getDiskActions(disk, setExpanded);
        const diskType = formatType(disk, true);

        rows.push({
          ...normaliseRowData(
            disk,
            actionsDisabled,
            expanded,
            selected,
            handleRowCheckbox,
            diskActions
          ),
          expandedContent: (
            <div className="u-flex--grow">
              {expanded?.content === "createLogicalVolume" && (
                <AddLogicalVolume
                  closeExpanded={closeExpanded}
                  disk={disk}
                  systemId={machine.system_id}
                />
              )}
              {expanded?.content === "createPartition" && (
                <AddPartition
                  closeExpanded={closeExpanded}
                  disk={disk}
                  systemId={machine.system_id}
                />
              )}
              {expanded?.content === "deleteDisk" && (
                <ActionConfirm
                  closeExpanded={closeExpanded}
                  confirmLabel={`Remove ${diskType}`}
                  eventName="deleteDisk"
                  message={`Are you sure you want to remove this ${diskType}?`}
                  onConfirm={() => {
                    dispatch(machineActions.cleanup());
                    dispatch(
                      machineActions.deleteDisk({
                        blockId: disk.id,
                        systemId,
                      })
                    );
                  }}
                  onSaveAnalytics={{
                    action: `Delete ${diskType}`,
                    category: "Machine storage",
                    label: `Remove ${diskType}`,
                  }}
                  statusKey="deletingDisk"
                  systemId={systemId}
                />
              )}
              {expanded?.content === "deleteVolumeGroup" && (
                <ActionConfirm
                  closeExpanded={closeExpanded}
                  confirmLabel="Remove volume group"
                  eventName="deleteVolumeGroup"
                  message="Are you sure you want to remove this volume group?"
                  onConfirm={() => {
                    dispatch(machineActions.cleanup());
                    dispatch(
                      machineActions.deleteVolumeGroup({
                        systemId,
                        volumeGroupId: disk.id,
                      })
                    );
                  }}
                  onSaveAnalytics={{
                    action: "Delete volume group",
                    category: "Machine storage",
                    label: "Remove volume group",
                  }}
                  statusKey="deletingVolumeGroup"
                  systemId={systemId}
                />
              )}
              {expanded?.content === "editLogicalVolume" && (
                <EditLogicalVolume
                  closeExpanded={closeExpanded}
                  disk={disk}
                  systemId={machine.system_id}
                />
              )}
            </div>
          ),
        });
      }

      if (disk.partitions) {
        disk.partitions.forEach((partition) => {
          if (isAvailable(partition)) {
            const partitionActions = [
              {
                children: "Remove partition...",
                "data-test": "deletePartition",
                onClick: () =>
                  setExpanded({
                    content: "deletePartition",
                    id: uniqueId(partition),
                  }),
              },
              {
                children: "Edit partition...",
                "data-test": "editPartition",
                onClick: () =>
                  setExpanded({
                    content: "editPartition",
                    id: uniqueId(partition),
                  }),
              },
            ];

            rows.push({
              ...normaliseRowData(
                partition,
                actionsDisabled,
                expanded,
                selected,
                handleRowCheckbox,
                partitionActions
              ),
              expandedContent: (
                <div className="u-flex--grow">
                  {expanded?.content === "deletePartition" && (
                    <ActionConfirm
                      closeExpanded={closeExpanded}
                      confirmLabel="Remove partition"
                      eventName="deletePartition"
                      message="Are you sure you want to remove this partition?"
                      onConfirm={() => {
                        dispatch(machineActions.cleanup());
                        dispatch(
                          machineActions.deletePartition({
                            partitionId: partition.id,
                            systemId,
                          })
                        );
                      }}
                      onSaveAnalytics={{
                        action: "Delete partition",
                        category: "Machine storage",
                        label: "Remove partition",
                      }}
                      statusKey="deletingPartition"
                      systemId={systemId}
                    />
                  )}
                  {expanded?.content === "editPartition" && (
                    <EditPartition
                      closeExpanded={() => setExpanded(null)}
                      disk={disk}
                      partition={partition}
                      systemId={machine.system_id}
                    />
                  )}
                </div>
              ),
            });
          }
        });
      }
    });

    return (
      <>
        <MainTable
          className="p-table-expanding--light"
          expanding
          headers={[
            {
              content: (
                <div className="u-flex">
                  <Input
                    checked={selected.length > 0}
                    className={classNames("has-inline-label", {
                      "p-checkbox--mixed": selected.length !== rows.length,
                    })}
                    data-test="all-disks-checkbox"
                    disabled={actionsDisabled || rows.length === 0}
                    id="all-disks-checkbox"
                    label={" "}
                    onChange={handleAllCheckbox}
                    type="checkbox"
                    wrapperClassName="u-no-margin--bottom u-align-header-checkbox u-nudge--checkbox"
                  />
                  <div>
                    <div>Name</div>
                    <div>Serial</div>
                  </div>
                </div>
              ),
            },
            {
              content: (
                <div>
                  <div>Model</div>
                  <div>Firmware</div>
                </div>
              ),
            },
            {
              className: "u-align--center",
              content: <div>Boot</div>,
            },
            {
              content: <div>Size</div>,
            },
            {
              content: (
                <div>
                  <div>Type</div>
                  <div>NUMA node</div>
                </div>
              ),
            },
            {
              content: (
                <div>
                  <div>Health</div>
                  <div>Tags</div>
                </div>
              ),
            },
            {
              className: "u-align--right",
              content: <div>Actions</div>,
            },
          ]}
          rows={rows}
        />
        {rows.length === 0 && (
          <div className="u-nudge-right--small" data-test="no-available">
            No available disks or partitions.
          </div>
        )}
        {canEditStorage && (
          <BulkActions
            bulkAction={bulkAction}
            selected={selected}
            setBulkAction={setBulkAction}
            systemId={systemId}
          />
        )}
      </>
    );
  }
  return null;
};

export default AvailableStorageTable;
