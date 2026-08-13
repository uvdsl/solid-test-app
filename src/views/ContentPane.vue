<script lang="ts" setup>
import { ref, computed } from "vue";
import { useSolidSession } from "../composables/useSolidSession";

import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

import {
  putResource,
  deleteResource,
  getResource,
  parseToN3,
  createContainer,
  getLocationHeader,
  patchResource,
  postResource,
} from "@uvdsl/solid-requests";
import { AccessRequestGenerator, AccessMode } from "@uvdsl/solid-access-requests";


const toast = useToast();
const confirm = useConfirm();
const { session, state } = useSolidSession();

// uri of the information resource
const uri = ref("");
const isHTTP = computed(
  () => uri.value.startsWith("http://") || uri.value.startsWith("https://")
);

// media-type
const mediaType = ref("");

// content of the information resource
const content = ref("");

// get content of information resource
const fetch = async () => {
  if (!isHTTP.value) {
    return;
  }
  content.value = await getResource(uri.value, session, { "Accept": mediaType.value })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Error on fetch!",
        detail: err,
        life: 5000,
      });
      throw new Error(err);
    })
    .then((resp) => {
      mediaType.value = resp.headers.get("content-type") || "";
      return resp.text()
    });
};

// SplitButton
const splitButtonActions = [
  {
    label: "PUT",
    icon: "pi pi-save",
    tooltipOptions: "left",
    command: async () => {
      if (!isHTTP.value) {
        toast.add({
          severity: "error",
          summary: "Missing URI to save at!",
          detail: "Specify a HTTP-URI in the search bar.",
          life: 5000,
        });
        return;
      }
      if (!mediaType.value) {
        toast.add({
          severity: "error",
          summary: "Missing media-type!",
          detail: "Specify a media-type in the search bar.",
          life: 5000,
        });
        return;
      }
      putResource(uri.value, content.value, session, { "Content-Type": mediaType.value })
        .then(() =>
          toast.add({
            severity: "success",
            summary: "Successful Save!",
            detail: "The resource has been PUT at the URI.",
            life: 5000,
          })
        )
        .catch((err) =>
          toast.add({
            severity: "error",
            summary: "Error on save!",
            detail: err,
            life: 5000,
          })
        );
    },
  },
  {
    label: "PATCH",
    icon: "pi pi-bolt",
    tooltipOptions: "left",
    command: async () => {
      if (!isHTTP.value) {
        toast.add({
          severity: "error",
          summary: "Missing URI to patch!",
          detail: "Specify a HTTP-URI in the search bar.",
          life: 5000,
        });
        return;
      }
      if (mediaType.value && mediaType.value !== "text/n3") {
        toast.add({
          severity: "error",
          summary: "PATCH media-type!",
          detail: "Media-type must be `text/n3` (or empty).",
          life: 5000,
        });
        return;
      }
      patchResource(uri.value, content.value, session)
        .then(() =>
          toast.add({
            severity: "success",
            summary: "Successful Save!",
            detail: "The resource has been patched.",
            life: 5000,
          })
        )
        .catch((err) =>
          toast.add({
            severity: "error",
            summary: "Error on save!",
            detail: err,
            life: 5000,
          })
        );
    },
  },
  {
    separator: true
  },
   {
    label: "POST (to create Resource)",
    icon: "pi pi-envelope",
    tooltipOptions: "left",
    command: async () => {
      if (!isHTTP.value) {
        toast.add({
          severity: "error",
          summary: "Missing URI to save at!",
          detail: "Specify a HTTP-URI in the search bar.",
          life: 5000,
        });
        return;
      }
      if (!mediaType.value) {
        toast.add({
          severity: "error",
          summary: "Missing media-type!",
          detail: "Specify a media-type in the search bar.",
          life: 5000,
        });
        return;
      }
      postResource(uri.value, content.value, session, {"Content-Type":mediaType.value})
        .then(resp => getLocationHeader(resp))
        .then(loc => content.value = `Location: ${loc}`)
        .then(() =>
          toast.add({
            severity: "success",
            summary: "Successful Save!",
            detail: "The resource has been posted to the container URI.",
            life: 5000,
          })
        )
        .catch((err) =>
          toast.add({
            severity: "error",
            summary: "Error on save!",
            detail: err,
            life: 5000,
          })
        );
    },
  },
  {
    label: "POST (to create Container)",
    icon: "pi pi-envelope",
    tooltipOptions: "left",
    command: async () => {
      if (!isHTTP.value) {
        toast.add({
          severity: "error",
          summary: "Missing URI to save at!",
          detail: "Specify a HTTP-URI in the search bar.",
          life: 5000,
        });
        return;
      }
      if (mediaType.value) {
        toast.add({
          severity: "error",
          summary: "Missing media-type!",
          detail: "Specify a media-type in the search bar.",
          life: 5000,
        });
        return;
      }
      createContainer(uri.value, content.value, session)
        .then(resp => getLocationHeader(resp))
        .then(loc => content.value = `Location: ${loc}`)
        .then(() =>
          toast.add({
            severity: "success",
            summary: "Successful Save!",
            detail: "The resource has been posted to the container URI.",
            life: 5000,
          })
        )
        .catch((err) =>
          toast.add({
            severity: "error",
            summary: "Error on save!",
            detail: err,
            life: 5000,
          })
        );
    },
  },
  {
    separator: true
  },
  {
    label: "DELETE",
    icon: "pi pi-trash",
    severity: "danger",
    command: () => {
      confirm.require({
        message: `Delete <${uri.value}> ?`,
        header: 'Danger Zone',
        icon: 'pi pi-question-circle',
        rejectLabel: 'Cancel',
        rejectProps: {
          label: 'Cancel',
          severity: 'secondary',
          outlined: true
        },
        acceptProps: {
          label: 'Delete',
          severity: 'danger'
        },
        accept: () => {
          if (!isHTTP.value) {
            toast.add({
              severity: "error",
              summary: "Missing URI to delete!",
              detail: "Specify a HTTP-URI in the search bar.",
              life: 5000,
            });
            return;
          }
          deleteResource(uri.value, session)
            .then(() =>
              toast.add({
                severity: "success",
                summary: "Successful Delete!",
                detail: "The resource has been deleted.",
                life: 5000,
              })
            )
            .catch((err) =>
              toast.add({
                severity: "error",
                summary: "Error on delete!",
                detail: err,
                life: 5000,
              })
            );
        },
        reject: () => {
          // toast.add({ severity: 'info', summary: 'ACK', detail: 'Nothing happened.', life: 3000 });
        }
      });
    },
  },
];

// Speeddial
const speedDialActions = [
  {
    label: "Check Syntax",
    icon: "pi pi-code",
    command: () => {
      parseToN3(content.value, uri.value)
        .catch((err) => {
          toast.add({
            severity: "error",
            summary: "Error while parsing!",
            detail: err,
            life: 5000,
          });
          throw new Error(err);
        })
        .then(() =>
          toast.add({
            severity: "success",
            summary: "Correct Syntax.",
            detail: "Good job!",
            life: 5000,
          })
        );
    },
  },
  {
    label: "Draft Access Request",
    icon: "pi pi-ticket",
    command: () => {
      const recipient = new URL("/profile/card#me", uri.value).href; // cheap guess
      const request = new AccessRequestGenerator({
        requester: state.webId!,
        recipient,
        grantee: state.webId!,
        purpose: 'https://example.org/test',
        context: 'https://example.org/test'
      });

      // 2. Add a REQUIRED bundle (User MUST grant these to proceed)
      request.addRequiredGroup([
        {
          instanceUri: uri.value,
          modes: [AccessMode.Read]
        },
      ]);

      // 3. Add an OPTIONAL bundle (User can choose to reject these)
      request.addOptionalGroup([
        {
          instanceUri: uri.value,
          modes: [AccessMode.Write]
        }
      ]);

      // 4. Generate the request body in Turtle serialisation
      const requestBody = request.toTTL();
      content.value = requestBody;
      uri.value = new URL("/inbox/", uri.value).href; // cheap guess
    },
  }
];
</script>

<template>
  <div class="p-grid p-4 max-w-screen-xl mx-auto">

    <div class="p-col-12 mb-3">
      <InputGroup class="shadow-2">
        <InputText placeholder="URI" v-model="uri" @keyup.enter="fetch" class="p-inputtext-lg" style="flex:3" />
        <InputText placeholder="media-type" v-model="mediaType" @keyup.enter="fetch" class="p-inputtext-lg" style="flex:1" />
        <SplitButton label="GET" @click="fetch" :model="splitButtonActions" />
      </InputGroup>
    </div>

    <div class="p-col-12">
      <Textarea v-model="content" class="sizing shadow-2 p-3" />
    </div>
  </div>

  <div class="speeddial-container">
    <SpeedDial :model="speedDialActions" type="semi-circle" :radius="75" showIcon="pi pi-ellipsis-h" class="centered-speeddial" :buttonProps="{ class: 'p-button-lg shadow-4' }">
      <template #item="{ item }">
        <Button :icon="item.icon" v-tooltip.top="item.label" :severity="item.severity" @click="item.command as any" class="p-speeddial-action" rounded />
      </template>
    </SpeedDial>
  </div>
  <ConfirmDialog></ConfirmDialog>
</template>

<style scoped>
::v-deep() {
  .sizing {
    height: calc(100vh - 275px);
    width: 100%;
    resize: none;
    border: 1px solid var(--surface-d);
    border-radius: 6px;
    font-family: monospace;
    padding-bottom: 80px !important;
  }

  .sizing:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-color-200);
  }

  .p-speeddial {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
  }

  .p-splitbutton-button {
    border-top-left-radius: 0pt;
    border-bottom-left-radius: 0pt
  }
}
</style>