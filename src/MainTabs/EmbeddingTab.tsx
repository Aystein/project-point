import { Button, Modal, Select } from "@mantine/core";
import { useMemo, useState } from "react";
import { groupBy as rowGrouper } from "lodash";
import "react-data-grid/lib/styles.css";
import DataGrid, { SelectColumn } from "react-data-grid";
import { useDispatch, useSelector } from "react-redux";
import {
  hideNotification,
  showNotification,
  updateNotification,
} from "@mantine/notifications";
import { Selectors } from "../Store/Selectors";
import { VectorLike } from "../Interfaces";
import { initializeModel, modelAdapter } from "../Store/ModelSlice";
import { nanoid } from "@reduxjs/toolkit";
import { changeWorkspace } from "../Store/ViewSlice";
import { getBounds } from "../Util";
import { encode } from "./encode";
import { NN } from "./NN";
import { TSNE } from "./tSNE";

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

export function EmbeddingTab() {
  const data = useSelector(Selectors.data);
  const models = useSelector(Selectors.models);
  const dispatch = useDispatch();

  const [opened, setOpened] = useState(false);

  const items = useMemo(() => {
    return modelAdapter
      .getSelectors()
      .selectAll(models)
      .map((value) => ({
        value: value.id as string,
        label: "umap",
      }));
  }, [models]);

  return (
    <div>
      <TSNE />
      <NN />

      <Select
        label="Choose projection"
        placeholder="Pick one"
        data={items}
        maxDropdownHeight={400}
        nothingFound="Nobody here"
        onChange={(value) => {
          const model = modelAdapter.getSelectors().selectById(models, value);

          if (model) {
            dispatch(changeWorkspace(model.id));
          }
        }}
      />
    </div>
  );
}
