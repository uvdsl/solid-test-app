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
  postResource,
  getLocationHeader,
} from "@uvdsl/solid-requests";


const toast = useToast();
const confirm = useConfirm();
const { session } = useSolidSession();

// uri of the information resource
const uri = ref("");
const isHTTP = computed(
  () => uri.value.startsWith("http://") || uri.value.startsWith("https://")
);

// content of the information resource
const content = ref("");

// get content of information resource
const fetch = async () => {
  if (!isHTTP.value) {
    return;
  }
  const txt = await getResource(uri.value, session)
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Error on fetch!",
        detail: err,
        life: 5000,
      });
      throw new Error(err);
    })
    .then((resp) => resp.text());
  //   const parsedN3 =
  await parseToN3(txt, uri.value.split("__0x")[0])
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Error!",
        detail: err,
        life: 5000,
      });
      //   throw new Error(err);
    })
    .finally(() => (content.value = txt));
};

// Speeddial
const speedDialActions = [
  {
    label: "PUT Resource",
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
      putResource(uri.value, content.value, session)
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
    label: "POST Resource",
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
      postResource(uri.value, content.value, session)
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
    label: "Delete Resource",
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
</script>

<template>
  <div class="p-grid p-4 max-w-screen-xl mx-auto">

    <div class="p-col-12 mb-3">
      <InputGroup class="shadow-2">
        <InputText placeholder="The URI of the Resource to do actions on." v-model="uri" @keyup.enter="fetch"
          class="p-inputtext-lg" />
        <Button label="GET" @click="fetch" class="p-button-lg" />
      </InputGroup>
    </div>

    <div class="p-col-12">
      <Textarea v-model="content" class="sizing shadow-2 p-3" />
    </div>
  </div>

  <div class="speeddial-container">
    <SpeedDial :model="speedDialActions" type="semi-circle" :radius="75" showIcon="pi pi-ellipsis-h"
      :tooltipOptions="{ position: 'top'} as any" class="centered-speeddial" :buttonProps="{ class: 'p-button-lg shadow-4' }">
      <template #item="{ item }">
        <Button :icon="item.icon" :severity="item.severity" @click="item.command as any" class="p-speeddial-action" rounded />
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
}
</style>