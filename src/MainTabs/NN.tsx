import { Button, Modal, Select } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { groupBy as rowGrouper } from "lodash";
import "react-data-grid/lib/styles.css";
import DataGrid, { SelectColumn, SelectCellFormatter } from "react-data-grid";
import { useDispatch, useSelector } from "react-redux";
import {
  hideNotification,
  showNotification,
  updateNotification,
} from "@mantine/notifications";
import { Selectors } from "../Store/Selectors";
import { initializeModel, modelAdapter } from "../Store/ModelSlice";
import { nanoid } from "@reduxjs/toolkit";
import { getBounds } from "../Util";
import { encode, unmap } from "./encode";

export function NN() {
  const data = useSelector(Selectors.data);
  const models = useSelector(Selectors.models);
  const dispatch = useDispatch();

  const [opened, setOpened] = useState(false);
  const [classFeature, setClassFeature] = useState<number>(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    setRows(
      data.columns.map((column, id) => ({
        id,
        name: column.key,
        isClass: false,
      }))
    );
  }, [data]);

  const handleTSNE = () => {
    setOpened(true);
  };

  const [expandedGroupIds, setExpandedGroupIds] = useState<
    ReadonlySet<unknown>
  >(() => new Set<unknown>([]));
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
    () => new Set()
  );

  const columns = [
    SelectColumn,
    { key: "name", name: "ID" },
    {
      key: "isClass",
      name: "Class Label",
      width: 80,
      formatter({ row, onRowChange, isCellSelected }) {
        return (
          <SelectCellFormatter
            value={row.isClass}
            onChange={() => {
              onRowChange({ ...row, isClass: !row.isClass });
            }}
            isCellSelected={isCellSelected}
          />
        );
      },
    },
  ];

  const run = () => {
    showNotification({
      id: "nn",
      title: "NN",
      message: "Computing NN ...",
      loading: true,
      autoClose: false,
      color: "teal",
    });

    const result = Array.from(selectedRows).map((value) => rows[value].name);
    const classLabel = rows.filter((row) => row.isClass).map((row) => row.name);

    const { X, N, D } = encode(data, result);

    // Class label
    const { X: Y } = encode(data, classLabel);

    const worker = new Worker(
      new URL("../workers/tensorworker.ts", import.meta.url)
    );
    worker.postMessage({
      X,
      N,
      D,
      Y,
      type: "init",
    });
    worker.onmessage = ({
      data: { type, model },
    }: {
      data: { model; type: string };
    }) => {
      switch (type) {
        case "finish":
          updateNotification({
            id: "nn",
            autoClose: 3000,
            message: "NN completed!",
            color: "green",
          });

          console.log(model);

          

          dispatch(
            initializeModel({
              oid: "neural",
              id: nanoid(),
              features: result,
              classLabel,
            })
          );
          break;
      }
    };
  };

  return (
    <div>
      <Button onClick={handleTSNE}>Neural Network</Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="This is fullscreen modal!"
        fullScreen
      >
        <DataGrid
          groupBy={["title"]}
          rowGrouper={rowGrouper}
          expandedGroupIds={expandedGroupIds}
          onExpandedGroupIdsChange={setExpandedGroupIds}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          rowKeyGetter={(row) => row.id}
          onRowsChange={setRows}
          rows={rows}
          columns={columns}
        ></DataGrid>
        <Button
          onClick={() => {
            setOpened(false);
            run();
          }}
        >
          Run
        </Button>
      </Modal>
    </div>
  );
}
