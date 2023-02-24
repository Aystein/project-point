import { FileInput, Flex } from "@mantine/core";
import Papa from "papaparse";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { initialize, Row } from "../Store/DataSlice.";



export function DataTab() {
  const dispatch = useDispatch();

  const [dataset, setDataset] = useState<any[]>([]);

  const handleChange = (file: File) => {
    console.log(file);
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        dispatch(initialize(results.data));
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
