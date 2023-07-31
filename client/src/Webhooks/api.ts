const apiBase = "http://localhost:3001";
const token = "";

export interface WebhookConfig {
  username?: string;
  status: string;
}

export type WebhooksWithStatus = {
  [key: string]: WebhookConfig;
};

export const getWebhooksWithStatus = async (
  applicationID: string
): Promise<WebhooksWithStatus> => {
  const response = await fetch(
    `${apiBase}/applications/${applicationID}/webhooks`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!isStatus200(response.status)) {
    console.error(`Invalid response status ${response.status}`);
  }
  return response.json();
};

export type AddWebhooksRequest = {
  [key: string]: {
    username?: string;
  };
};

export const addWebhooks = async (
  applicationID: string,
  webhooks: AddWebhooksRequest
) => {
  const response = await fetch(
    `${apiBase}/applications/${applicationID}/webhooks`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhooks),
    }
  );
  
  if (!isStatus200(response.status)) {
    console.error(`Invalid response status ${response.status}`);
  }
  return;
};

export const removeWebhook = async (applicationID: string, uri: string) => {
  const response = await fetch(
    `${apiBase}/applications/${applicationID}/webhooks/${encodeURIComponent(
      uri
    )}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!isStatus200(response.status)) {
    console.error(`Invalid response status ${response.status}`);
  }
  return;
};

const isStatus200 = (status: number) => status >= 200 && status < 300;
