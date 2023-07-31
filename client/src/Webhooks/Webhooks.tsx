import * as React from "react";
import { useState } from "react";
import { Box, StackDivider, VStack } from "@chakra-ui/react";

import { Add } from "./Add";
import { List } from "./List";

export const Webhooks = () => {
  const [shouldRefresh, setShouldRefresh] = useState({});
  const handleWebhooksAddeed = () => {
    setShouldRefresh({});
  };

  return (
    <VStack
      divider={<StackDivider borderColor="gray.200" />}
      spacing={4}
      align="stretch"
      minW="500px"
    >
      <List refresh={shouldRefresh} />
      <Add onWebhooksAdded={handleWebhooksAddeed} />
    </VStack>
  );
};
