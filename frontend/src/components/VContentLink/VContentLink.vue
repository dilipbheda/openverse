<script setup lang="ts">
import { useNuxtApp } from "#imports"
import { computed } from "vue"

import type { SupportedMediaType } from "#shared/constants/media"
import useSearchType from "~/composables/use-search-type"
import { useHydrating } from "~/composables/use-hydrating"
import { useI18nResultsCount } from "~/composables/use-i18n-utilities"

import VButton from "~/components/VButton.vue"
import VIcon from "~/components/VIcon/VIcon.vue"

const props = defineProps<{
  mediaType: SupportedMediaType
  /**
   * Current search term for aria-label.
   */
  searchTerm: string
  /**
   * The number of results that the search returned. The link
   * will be disabled if this value is zero.
   */
  resultsCount: number
  /**
   * The route target of the link.
   */
  to?: string
}>()

defineEmits<{
  "shift-tab": [KeyboardEvent]
}>()

const { getI18nCount, getI18nContentLinkLabel } = useI18nResultsCount()
const resultsCountLabel = computed(() => getI18nCount(props.resultsCount))

const resultsAriaLabel = computed(() =>
  getI18nContentLinkLabel(props.resultsCount, props.searchTerm, props.mediaType)
)

const { activeType } = useSearchType({ component: "VContentLink" })
const { $sendCustomEvent } = useNuxtApp()

const handleClick = () => {
  $sendCustomEvent("CHANGE_CONTENT_TYPE", {
    previous: activeType.value,
    next: props.mediaType,
    component: "VContentLink",
  })
}

const { doneHydrating } = useHydrating()
</script>

<template>
  <VButton
    as="VLink"
    :href="to"
    :aria-label="resultsAriaLabel"
    variant="bordered-gray"
    size="disabled"
    :disabled="!doneHydrating"
    class="h-auto w-full flex-col !items-start !justify-start gap-1 overflow-hidden p-4 sm:h-18 sm:flex-row sm:!items-center sm:gap-2 sm:px-6"
    @keydown.shift.tab.exact="$emit('shift-tab', $event)"
    @mousedown="handleClick"
  >
    <VIcon :name="mediaType" />
    <p class="label-bold sm:description-bold mt-1 sm:mt-0">
      {{ $t(`searchType.${mediaType}`) }}
    </p>
    <span
      class="label-regular sm:description-regular text-secondary group-hover/button:text-default sm:ms-auto"
      >{{ resultsCountLabel }}</span
    >
  </VButton>
</template>
