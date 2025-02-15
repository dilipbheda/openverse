<script setup lang="ts">
import { reactive, ref } from "vue"

import type { SupportedMediaType } from "#shared/constants/media"
import type { MediaProvider } from "#shared/types/media-provider"
import { useProviderStore } from "~/stores/provider"
import { useSearchStore } from "~/stores/search"
import { useGetLocaleFormattedNumber } from "~/composables/use-get-locale-formatted-number"

import TableSortIcon from "~/components/TableSortIcon.vue"
import VLink from "~/components/VLink.vue"

const props = defineProps<{ media: SupportedMediaType }>()

const providerStore = useProviderStore()
const searchStore = useSearchStore()

const sorting = reactive({
  direction: "asc",
  field: "display_name" as keyof Omit<MediaProvider, "logo_url">,
})

// The providers in store are sorted by `source_name`, here we sort them by `display_name`.
const providers = ref<MediaProvider[]>(
  providerStore.providers[props.media].sort(compareProviders)
)

function sortTable(field: keyof Omit<MediaProvider, "logo_url">) {
  let direction = field === "media_count" ? "desc" : "asc"
  if (field === sorting.field) {
    direction = sorting.direction === "asc" ? "desc" : "asc"
  }

  sorting.direction = direction
  sorting.field = field

  const sortedProviders = providers.value.sort(compareProviders)

  providers.value =
    direction === "asc" ? sortedProviders : sortedProviders.reverse()
}

function cleanSourceUrlForPresentation(url: string) {
  const stripProtocol = (s: string) => s.replace(/https?:\/\//, "")
  const stripLeadingWww = (s: string) =>
    s.startsWith("www.") ? s.replace("www.", "") : s
  const removeAfterSlash = (s: string) => s.split("/")[0]

  return removeAfterSlash(stripLeadingWww(stripProtocol(url)))
}

const getLocaleFormattedNumber = useGetLocaleFormattedNumber()

function compareProviders(prov1: MediaProvider, prov2: MediaProvider) {
  let field1 = prov1[sorting.field]
  let field2 = prov2[sorting.field]
  if (sorting.field === "display_name") {
    field1 = prov1[sorting.field].toLowerCase()
    field2 = prov2[sorting.field].toLowerCase()
  }

  if (sorting.field === "source_url") {
    field1 = cleanSourceUrlForPresentation(field1 as string)
    field2 = cleanSourceUrlForPresentation(field2 as string)
  }
  if (field1 > field2) {
    return 1
  }
  if (field1 < field2) {
    return -1
  }
  return 0
}

const providerViewUrl = (provider: MediaProvider) => {
  return searchStore.getCollectionPath({
    type: props.media,
    collectionParams: {
      collection: "source",
      source: provider.source_name,
    },
  })
}
</script>

<template>
  <div>
    <table
      :aria-label="$t('sources.aria.table')"
      role="region"
      class="not-prose source-table w-full table-fixed text-base"
    >
      <thead>
        <tr>
          <th
            tabindex="0"
            @click="sortTable('display_name')"
            @keypress.enter="sortTable('display_name')"
          >
            <span class="flex w-full flex-row items-center justify-between">
              {{ $t("sources.providers.source") }}
              <TableSortIcon :active="sorting.field === 'display_name'" />
            </span>
          </th>
          <th
            tabindex="0"
            @click="sortTable('source_url')"
            @keypress.enter="sortTable('source_url')"
          >
            <span class="flex w-full flex-row items-center justify-between">
              {{ $t("sources.providers.domain") }}
              <TableSortIcon :active="sorting.field === 'source_url'" />
            </span>
          </th>
          <th
            tabindex="0"
            @click="sortTable('media_count')"
            @keypress.enter="sortTable('media_count')"
          >
            <span class="flex w-full flex-row items-center justify-between">
              {{ $t("sources.providers.item") }}
              <TableSortIcon :active="sorting.field === 'media_count'" />
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="provider in providers" :key="provider.display_name">
          <td>
            <VLink :href="providerViewUrl(provider)">{{
              provider.display_name
            }}</VLink>
          </td>
          <td class="truncate font-semibold">
            <VLink :href="provider.source_url">
              {{ cleanSourceUrlForPresentation(provider.source_url) }}
            </VLink>
          </td>
          <td class="text-right">
            {{ getLocaleFormattedNumber(provider.media_count || 0) }}
          </td>
        </tr>
      </tbody>
    </table>

    <section role="region" class="mobile-source-table md:hidden">
      <article
        v-for="provider in providers"
        :key="provider.display_name"
        :title="provider.display_name"
      >
        <p>{{ $t("sources.providers.source") }}</p>

        <VLink :href="providerViewUrl(provider)">{{
          provider.display_name
        }}</VLink>

        <p>{{ $t("sources.providers.domain") }}</p>

        <VLink :href="provider.source_url">
          {{ cleanSourceUrlForPresentation(provider.source_url) }}
        </VLink>

        <p>{{ $t("sources.providers.item") }}</p>

        <span>
          {{ getLocaleFormattedNumber(provider.media_count || 0) }}
        </span>
      </article>
    </section>
  </div>
</template>

<style scoped>
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .source-table {
    @apply hidden rounded-sm border-0 border-default md:table;
  }

  .source-table th,
  .source-table td {
    @apply border-default;
  }

  .source-table a {
    @apply text-link hover:underline;
  }

  .source-table th {
    @apply cursor-pointer border-t bg-secondary;
  }

  .source-table th,
  .source-table td {
    @apply border-r p-4 first:border-l;
  }

  .source-table td {
    @apply break-normal border-y-0;
  }

  .source-table tr {
    @apply even:bg-surface;
  }

  .source-table th {
    @apply first:rounded-ss-sm last:rounded-se-sm;
  }

  .source-table tr:last-child td {
    @apply border-b first:rounded-es-sm last:rounded-ee-sm;
  }

  .mobile-source-table article {
    @apply grid border-l border-r border-default p-4 sm:grid-cols-4;
  }

  .mobile-source-table article:first-child {
    @apply border-t;
  }

  .mobile-source-table article:last-child {
    @apply border-b;
  }

  .mobile-source-table article:nth-child(odd) {
    @apply bg-secondary;
  }

  .mobile-source-table article p {
    @apply col-span-1 pt-2 font-bold;
  }

  .mobile-source-table article p:first-child {
    @apply pt-0;
  }

  .mobile-source-table article a,
  .mobile-source-table article span {
    @apply col-span-3;
  }

  .mobile-source-table article a {
    @apply font-bold text-link hover:underline;
  }
}
</style>
