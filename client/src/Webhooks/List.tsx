import * as React from "react";
import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Center,
  Code,
  List as CList,
  ListIcon,
  ListItem,
  HStack,
  IconButton,
  Spinner,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
} from "@chakra-ui/react";
import {
  RiCheckboxCircleFill,
  RiDeleteBin5Fill,
  RiErrorWarningFill,
  RiRefreshLine,
  RiUser3Fill,
} from "react-icons/ri";

import {
  getWebhooksWithStatus,
  WebhooksWithStatus,
  removeWebhook,
} from "./api";

interface ListProps {
  refresh?: {};
}

export const List = (props: ListProps) => {
  const [webhooks, setWebhooks] = useState<WebhooksWithStatus | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    console.log("fetching data...");
    setIsLoading(true);
    const data = await getWebhooksWithStatus("1");
    setWebhooks(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [props.refresh]);

  const removalHandlerFactory = (uri: string) => async () => {
    await removeWebhook("1", uri);
    await fetchData();
  };

  return (
    <>
      <HStack>
        <Button
          disabled={isLoading}
          size="xs"
          leftIcon={<RiRefreshLine />}
          onClick={() => fetchData()}
          aria-label="Refresh"
          mb={4}
          mx="auto"
        >
          Refresh
        </Button>
      </HStack>

      {(isLoading || !webhooks) && (
        <Center>
          <Spinner />
        </Center>
      )}

      {!isLoading && webhooks && Object.keys(webhooks).length === 0 && (
        <Center>
          <Text color={"gray.500"}>There are no Webhooks enrolled!</Text>
        </Center>
      )}

      {!isLoading && webhooks && Object.keys(webhooks).length > 0 && (
        <CList spacing={2}>
          {Object.keys(webhooks).map((uri) => {
            const value = webhooks[uri];

            const isOK = value.status === "";
            const icon = isOK ? RiCheckboxCircleFill : RiErrorWarningFill;
            const color = isOK ? "green.500" : "red.500";

            return (
              <ListItem>
                <ListIcon as={icon} color={color} />
                <Code>{uri}</Code>
                <TypeBadge username={value.username} />
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label="Remove"
                  icon={<RiDeleteBin5Fill />}
                  ml={1}
                  onClick={removalHandlerFactory(uri)}
                />
              </ListItem>
            );
          })}
        </CList>
      )}
    </>
  );
};

interface TypeBadgeProps {
  username?: string;
}

const TypeBadge = (props: TypeBadgeProps) => {
  let text;
  let trailer;

  if (props.username) {
    text = "HN User";
    trailer = (
      <Tag size="sm" variant="outline" colorScheme="orange">
        <TagLeftIcon as={RiUser3Fill} />
        <TagLabel>{props.username}</TagLabel>
      </Tag>
    );
  } else {
    text = "HN Newest";
  }

  return (
    <HStack display="inline-flex" alignItems="center">
      <Badge mx={1} variant="subtle" colorScheme="orange">
        {text}
      </Badge>
      {trailer}
    </HStack>
  );
};
