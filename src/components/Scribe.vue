<template>
  <div class="p-grid">
    <div class="p-inputgroup p-col-6 p-offset-3">
      <InputText
        placeholder="The URI of the Resource to do actions on."
        v-model="uri"
        @keyup.enter="fetch"
      />
      <Button @click="fetch"> GET </Button>
    </div>
    <div class="p-col-6 p-offset-3">
      <Textarea v-model="content" class="sizing" />
    </div>
  </div>
  <div class="p-grid">
    <div class="p-inputgroup p-col-6 p-offset-3">
      <SpeedDial
        :model="speedDialActions"
        type="semi-circle"
        :radius="75"
        showIcon="pi pi-ellipsis-h"
        :tooltipOptions="{ position: 'top' }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useSolidSession } from "@/composables/useSolidSession";

import { useToast } from "primevue/usetoast";
import {
  putResource,
  deleteResource,
  getResource,
  parseToN3,
  postResource,
} from "@/lib/solidRequests";

export default defineComponent({
  name: "Scribe",
  components: {},
  setup() {
    const toast = useToast();
    const { authFetch } = useSolidSession();

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
      const txt = await getResource(uri.value, authFetch.value)
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
          putResource(uri.value, content.value, authFetch.value)
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
          postResource(uri.value, undefined, content.value, authFetch.value)
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
        command: () => {
          if (!isHTTP.value) {
            toast.add({
              severity: "error",
              summary: "Missing URI to delete!",
              detail: "Specify a HTTP-URI in the search bar.",
              life: 5000,
            });
            return;
          }
          deleteResource(uri.value, authFetch.value)
            .then(() =>
              toast.add({
                severity: "warn",
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
      },
    ];

    return {
      uri,
      fetch,
      content,
      speedDialActions,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#back {
  position: absolute;
  margin: 2px;
}
.p-grid {
  margin: 5px;
}
.p-inputgroup {
  width: 50%;
}
::v-deep() {
  .p-speeddial {
    bottom: 0;
    right: calc(50% - 2rem);
    padding-bottom: 15px;
  }
  .sizing {
    height: calc(100vh - 240px);
    width: 100%;
    max-height: calc(100vh - 240px);
    max-width: 100%;
  }
}
.p-inputtextarea {
  width: 100%;
}
.border {
  border: 1px solid var(--surface-d);
  border-radius: 3px;
}
.border:hover {
  border: 1px solid var(--primary-color);
}
</style>
