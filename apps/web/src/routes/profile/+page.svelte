<script lang="ts">
  import type { IService } from "@area/types";
  import * as Card from "$lib/components/ui/card/index.js";
  import ServiceCard from "@/components/ServiceCard.svelte";

  let username = "Username";
  const mockServices: IService[] = [
    {
      name: "GitHub",
      description: "Connect to GitHub repositories and workflows",
      requiresAuth: true,
      authType: "oauth2",
      oauth: {
        authorizationUrl: "https://github.com/login/oauth/authorize",
        tokenUrl: "https://github.com/login/oauth/access_token",
        clientId: "mock-client-id",
        clientSecret: "mock-client-secret",
        scopes: ["repo", "workflow", "user:email"]
      },
      actions: [
        {
          name: "Repository Updated",
          description: "Trigger when a repository is updated",
          params: {
            repository: {
              type: "string",
              label: "Repository",
              required: true,
              description: "Repository name (owner/repo)"
            },
            branch: {
              type: "string",
              label: "Branch",
              required: false,
              default: "main"
            }
          },
          check: async (params, context) => {
            return !!params.repository;
          }
        },
        {
          name: "Pull Request Created",
          description: "Trigger when a new pull request is created",
          params: {
            repository: {
              type: "string",
              label: "Repository",
              required: true
            }
          },
          check: async (params, context) => {
            return !!params.repository;
          }
        }
      ],
      reactions: [
        {
          name: "Create Issue",
          description: "Create a new GitHub issue",
          params: {
            repository: {
              type: "string",
              label: "Repository",
              required: true,
              description: "Repository"
            },
            title: {
              type: "string",
              label: "Issue Title",
              required: true
            },
            body: {
              type: "string",
              label: "Issue Description",
              required: false
            }
          },
          execute: async (params, context) => {
            console.log("Creating issue:", params);
          }
        }
      ]
    },
    {
      name: "Discord",
      description: "Send messages and notifications to Discord",
      requiresAuth: true,
      authType: "oauth2",
      oauth: {
        authorizationUrl: "https://discord.com/api/oauth2/authorize",
        tokenUrl: "https://discord.com/api/oauth2/token",
        clientId: "mock-discord-client-id",
        clientSecret: "mock-discord-client-secret",
        scopes: ["bot", "identify"]
      },
      actions: [
        {
          name: "Message Received",
          description: "Trigger when a message is received",
          params: {
            channel: {
              type: "string",
              label: "Channel ID",
              required: true
            }
          },
          check: async (params, context) => {
            return !!params.channel;
          }
        }
      ],
      reactions: [
        {
          name: "Send Message",
          description: "Send a message to a Discord channel",
          params: {
            channel: {
              type: "string",
              label: "Channel ID",
              required: true
            },
            message: {
              type: "string",
              label: "Message Content",
              required: true
            }
          },
          execute: async (params, context) => {
            console.log("Sending Discord message:", params);
          }
        }
      ]
    },
    {
      name: "Slack",
      description: "Integrate with Slack for notifications",
      requiresAuth: true,
      authType: "oauth2",
      oauth: {
        authorizationUrl: "https://slack.com/oauth",
        tokenUrl: "https://slack.com/api/oauth.v2.access",
        clientId: "mock-slack-client-id",
        clientSecret: "mock-slack-client-secret",
        scopes: ["chat:write", "channels:read", "users:read"]
      },
      actions: [
        {
          name: "Message Posted",
          description: "Trigger when a message is posted",
          params: {
            channel: {
              type: "string",
              label: "Channel Name",
              required: true
            }
          },
          check: async (params, context) => {
            return !!params.channel;
          }
        }
      ],
      reactions: [
        {
          name: "Post Message",
          description: "Post a message to Slack",
          params: {
            channel: {
              type: "string",
              label: "Channel",
              required: true
            },
            text: {
              type: "string",
              label: "Message Text",
              required: true
            }
          },
          execute: async (params, context) => {
            console.log("Posting Slack message:", params);
          }
        }
      ]
    }
  ];
</script>

<div class="flex flex-col h-full w-full items-center gap-15 mt-15">
  <h1 class="text-3xl uppercase font-extrabold">Hello, {username}!</h1>
  <div class="flex items-center justify-center">
    <Card.Root class="w-3xs gap-2">
      <Card.Header>
        <Card.Title>Service linked</Card.Title>
      </Card.Header>
      <Card.Content>
        <h3>WIP</h3>
      </Card.Content>
    </Card.Root>
  </div>
  <span class="bg-foreground h-0.5 w-[80%]"></span>
  <div class="grid grid-cols-3 gap-5">
    {#each mockServices as service}
      <ServiceCard {service} />
    {/each}
  </div>
</div>
