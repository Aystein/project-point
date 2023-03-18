import { FileInput, Flex } from "@mantine/core";
import Papa from "papaparse";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { PapaPlugin } from "../PapaPlugin/PapaPlugin";
import { initialize, Row } from "../Store/DataSlice.";



export function DataTab() {
  const dispatch = useDispatch();

  const [dataset, setDataset] = useState<any[]>([]);

  const handleChange = (file: File) => {
    console.log(file);
    const plugin = new PapaPlugin<Row>();

    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      step: plugin.step,
      complete: () => {
        dispatch(initialize(plugin.data));
      },
      dynamicTyping: true,
    });
  };

  return (
    <Flex direction={"column"}>
      <FileInput
        placeholder="Pick file"
        label="CSV Upload"
        radius="xs"
        size="xs"
        withAsterisk
        onChange={handleChange}
      />
    </Flex>
  );
}
