import { Button, Modal, Select } from "@mantine/core";
import { useState } from "react";
import { groupBy as rowGrouper } from "lodash";
import "react-data-grid/lib/styles.css";
import DataGrid, { SelectColumn } from "react-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { showNotification, updateNotification } from "@mantine/notifications";
import { Selectors } from "../Store/Selectors";
import { VectorLike } from "../Interfaces";
import { initializeModel } from "../Store/ModelSlice";
import { nanoid } from "@reduxjs/toolkit";
import { getBounds } from "../Util";
import { encode } from "./encode";

function unmap(array: number[]): VectorLike[] {
  const result = new Array<VectorLike>(array.length / 2);
  for (let i = 0; i < result.length; i++) {
    result[i] = {
      x: array[i * 2],
      y: array[i * 2 + 1],
    };
  }
  return result;
}

export function TSNE() {
  const data = useSelector(Selectors.data);
  const models = useSelector(Selectors.models);
  const dispatch = useDispatch();

  const [opened, setOpened] = useState(false);

  const handleTSNE = () => {
    setOpened(true);
  };

  const [expandedGroupIds, setExpandedGroupIds] = useState<
    ReadonlySet<unknown>
  >(() => new Set<unknown>([]));
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
    () => new Set()
  );

  const columns = [SelectColumn, { key: "name", name: "ID" }];

  const rows = data.columns.map((column, id) => ({
    id,
    name: column.key,
  }));

  const run = () => {
    showNotification({
      id: "tsne",
      title: "t-SNE",
      message: "Computing t-SNE ...",
      loading: true,
      autoClose: false,
      color: "teal",
    });

    const result = Array.from(selectedRows).map((value) => rows[value].name);

    const { X, N, D } = encode(data, result);

    const worker = new Worker(new URL("../workers/test.ts", import.meta.url));
    worker.postMessage({
      X,
      N,
      D,
      type: "init",
    });
    worker.onmessage = ({
      data: { type, Y },
    }: {
      data: { Y: number[]; type: string };
    }) => {
      switch (type) {
        case "finish":
          updateNotification({
            id: "tsne",
            autoClose: 3000,
            message: "t-SNE completed!",
            color: "green",
          });

          const spatial = unmap(Y);
          dispatch(
            initializeModel({
              oid: 'spatial',
              id: nanoid(),
              spatial,
              bounds: getBounds(spatial),
            })
          );
          break;
      }
    };
  };

  return (
    <div>
      <Button onClick={handleTSNE}>t-SNE</Button>

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
