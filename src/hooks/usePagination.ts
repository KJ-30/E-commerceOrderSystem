import { ref, reactive, computed, watch } from 'vue'

interface PaginationState {
  page: number
  pageSize: number
  total: number
}

interface UsePaginationOptions {
  defaultPage?: number
  defaultPageSize?: number
  pageSizes?: number[]
  onPageChange?: (page: number, pageSize: number) => void | Promise<void>
}

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    defaultPage = 1,
    defaultPageSize = 10,
    pageSizes = [10, 20, 30, 50],
    onPageChange
  } = options

  const state = reactive<PaginationState>({
    page: defaultPage,
    pageSize: defaultPageSize,
    total: 0
  })

  const loading = ref(false)
  const pageSizesList = ref(pageSizes)

  const hasNextPage = computed(() => {
    return state.page < Math.ceil(state.total / state.pageSize)
  })

  const hasPrevPage = computed(() => {
    return state.page > 1
  })

  const totalPages = computed(() => {
    return Math.ceil(state.total / state.pageSize)
  })

  const startIndex = computed(() => {
    return (state.page - 1) * state.pageSize + 1
  })

  const endIndex = computed(() => {
    const end = state.page * state.pageSize
    return end > state.total ? state.total : end
  })

  async function goToPage(page: number): Promise<void> {
    if (page < 1 || page > totalPages.value) return
    state.page = page
    await triggerChange()
  }

  async function setPageSize(size: number): Promise<void> {
    state.pageSize = size
    state.page = 1
    await triggerChange()
  }

  async function nextPage(): Promise<void> {
    if (hasNextPage.value) {
      await goToPage(state.page + 1)
    }
  }

  async function prevPage(): Promise<void> {
    if (hasPrevPage.value) {
      await goToPage(state.page - 1)
    }
  }

  async function firstPage(): Promise<void> {
    await goToPage(1)
  }

  async function lastPage(): Promise<void> {
    await goToPage(totalPages.value)
  }

  function setTotal(total: number): void {
    state.total = total
  }

  function reset(): void {
    state.page = defaultPage
    state.pageSize = defaultPageSize
    state.total = 0
  }

  async function triggerChange(): Promise<void> {
    if (onPageChange) {
      loading.value = true
      try {
        await onPageChange(state.page, state.pageSize)
      } finally {
        loading.value = false
      }
    }
  }

  return {
    state,
    loading,
    pageSizesList,
    hasNextPage,
    hasPrevPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    setPageSize,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setTotal,
    reset
  }
}
