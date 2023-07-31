import * as React from "react";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Radio,
  RadioGroup,
  Spacer,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { HiLink } from "react-icons/hi";
import { RiAddFill, RiDeleteBin5Fill, RiSave2Line } from "react-icons/ri";

import { AddWebhooksRequest, addWebhooks } from "./api";

interface AddProps {
  onWebhooksAdded?: () => void;
}

export const Add = (props: AddProps) => {
  const [isAdding, setIsAdding] = useState(false);

  const toggleAdding = () => {
    setIsAdding((prev) => !prev);
  };

  const handleSubmit = async (req: AddWebhooksRequest) => {
    setIsAdding((prev) => !prev);

    await addWebhooks("1", req);

    // Notify the parent a Webhook has been added.
    if (props.onWebhooksAdded) {
      props.onWebhooksAdded();
    }
  };

  return (
    <>
      {isAdding ? (
        <Forms onCancel={toggleAdding} onSubmit={handleSubmit} />
      ) : (
        <Button
          leftIcon={<HiLink />}
          onClick={toggleAdding}
          rounded={"full"}
          px={6}
          colorScheme={"purple"}
          bg={"purple.400"}
          _hover={{ bg: "purple.500" }}
        >
          Add Webhooks
        </Button>
      )}
    </>
  );
};

const randomId = () =>
  window.crypto.getRandomValues(new Uint32Array(1)).toString(16);

interface FormsProps {
  onCancel: () => void;
  onSubmit: (AddWebhooksRequest) => void;
}

const Forms = (props: FormsProps) => {
  const [forms, setForms] = useState<{
    [key: string]: WebhookEnrollment | undefined;
  }>({
    [randomId()]: undefined,
  });

  const handleSave = () => {
    const m: AddWebhooksRequest = {};
    for (const v of Object.values(forms)) {
      if (v) {
        m[v.uri] = {
          username: v.user,
        };
      }
    }
    props.onSubmit(m);
  };

  const handleCancel = () => {
    setForms((forms) => {
      return {
        [randomId()]: undefined,
      };
    });
    props.onCancel();
  };

  const handleChangesFactory = (id: string) => (data: WebhookEnrollment) => {
    setForms((forms) => {
      return {
        ...forms,
        [id]: data,
      };
    });
  };

  const handleFormAddition = () => {
    setForms((forms) => {
      return { ...forms, [randomId()]: undefined };
    });
  };

  const handleFormRemovalFactory = (id: string) => () => {
    setForms((forms) => {
      const { [id]: _, ...rest } = forms;
      return rest;
    });
  };

  const isRemovalAllowed = Object.keys(forms).length > 1;

  return (
    <>
      <VStack spacing={5}>
        {Object.keys(forms).map((id, idx) => (
          <Box borderWidth="1px" borderRadius="lg" p={4} w="100%">
            <Form
              key={id}
              label={`Webhook ${idx + 1}`}
              isRemovalAllowed={isRemovalAllowed}
              onDelete={handleFormRemovalFactory(id)}
              onChange={handleChangesFactory(id)}
            />
          </Box>
        ))}
      </VStack>

      <Flex w="100%" pt={4}>
        <Button rounded={"full"} px={6} onClick={handleCancel}>
          Cancel
        </Button>
        <Spacer />
        <HStack>
          <Button
            rounded={"full"}
            px={6}
            leftIcon={<RiAddFill />}
            onClick={handleFormAddition}
          >
            Add Another
          </Button>
          <Button
            onClick={handleSave}
            rounded={"full"}
            px={6}
            colorScheme={"purple"}
            bg={"purple.400"}
            _hover={{ bg: "purple.500" }}
            leftIcon={<RiSave2Line />}
          >
            Save
          </Button>
        </HStack>
      </Flex>

      <Stack pt={6} spacing={6} direction={"row"}></Stack>
    </>
  );
};

enum WebhookType {
  HN_NEWEST = "newest",
  HN_USER = "user",
}

interface WebhookEnrollment {
  uri: string;
  user?: string;
}

interface FormProps {
  isRemovalAllowed: boolean;
  label: string;
  onDelete: () => void;
  onChange: (a: WebhookEnrollment) => void;
}

export const Form = (props: FormProps) => {
  const [webhookURI, setWebhookURI] = useState<string | undefined>();
  const [webhookType, setWebhookType] = useState<WebhookType>(
    WebhookType.HN_NEWEST
  );
  const [username, setUsername] = useState<string>();

  useEffect(() => {
    if (!webhookURI) {
      return;
    }

    const obj: WebhookEnrollment = {
      uri: webhookURI,
    };

    if (webhookType === WebhookType.HN_USER) {
      obj["user"] = username;
    }

    props.onChange(obj);
  }, [webhookURI, webhookType, username]);

  return (
    <>
      <Flex mb={4} alignItems="center">
        <Text fontWeight="bold">{props.label}</Text>
        <Spacer />
        <IconButton
          disabled={!props.isRemovalAllowed}
          variant="ghost"
          size="sm"
          aria-label="Remove"
          icon={<RiDeleteBin5Fill />}
          onClick={props.onDelete}
        />
      </Flex>

      <FormControl id="webhook_uri" isRequired mb={4}>
        <FormLabel>URI</FormLabel>
        <Input
          value={webhookURI}
          onChange={(e) => setWebhookURI(e.target.value)}
          type="text"
        />
      </FormControl>

      <FormControl id="webhook_type" isRequired mb={4}>
        <FormLabel>Type</FormLabel>
        <RadioGroup
          onChange={(e: WebhookType) => setWebhookType(e)}
          value={webhookType}
        >
          <Stack spacing={5} direction="row">
            <Radio value={WebhookType.HN_NEWEST} colorScheme="purple">
              HN Newest
            </Radio>
            <Radio value={WebhookType.HN_USER} colorScheme="purple">
              HN User
            </Radio>
          </Stack>
        </RadioGroup>
      </FormControl>

      {webhookType === "user" && (
        <FormControl id="hn_user" isRequired mb={4}>
          <FormLabel>HN Username</FormLabel>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
          />
        </FormControl>
      )}
    </>
  );
};
