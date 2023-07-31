import * as React from "react";
import {
  ChakraProvider,
  Container,
  Heading,
  Stack,
  Text,
  theme,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { Webhooks } from "./Webhooks/Webhooks";

export const App = () => (
  <ChakraProvider theme={theme}>
    <Container maxW={"5xl"}>
      <Stack
        pt={6}
        textAlign={"center"}
        align={"center"}
        spacing={{ base: 8, md: 10 }}
      >
        <Heading
          fontWeight={600}
          fontSize={{ base: "3xl" }}
          lineHeight={"110%"}
        >
          Work Trial Project:&nbsp;
          <Text as={"span"} color={"purple.400"}>
            Webhooks
          </Text>
          <ColorModeSwitcher justifySelf="flex-end" />
        </Heading>
        <Webhooks />
      </Stack>
    </Container>
  </ChakraProvider>
);
