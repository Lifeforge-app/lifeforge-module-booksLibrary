import { useModuleTranslation } from '@lifeforge/localization'
import {
  Button,
  ContextMenu,
  ContextMenuItem,
  FAB,
  useModalStore
} from '@lifeforge/ui'

import ModifyBookModal from '@/modals/ModifyBookModal'
import SearchBookModal from '@/modals/SearchBookModal'
import UploadFromDeviceModal from '@/modals/UploadFromDeviceModal'

function BookCreationMenu({ variant }: { variant: 'desktop' | 'mobile' }) {
  const { open } = useModalStore()
  const { t } = useModuleTranslation()

  const items = (
    <>
      <ContextMenuItem
        icon="tabler:search"
        label="searchBooks"
        onClick={() => open(SearchBookModal, {})}
      />
      <ContextMenuItem
        icon="keyline-icons:book-plus"
        label="addPhysicalBook"
        onClick={() =>
          open(ModifyBookModal, { initialData: { formats: ['physical'] } })
        }
      />
      <ContextMenuItem
        icon="tabler:upload"
        label="uploadFromDevice"
        onClick={() => open(UploadFromDeviceModal, {})}
      />
    </>
  )

  if (variant === 'desktop') {
    return (
      <ContextMenu
        buttonComponent={
          <Button
            display={{ base: 'none', md: 'flex' }}
            icon="tabler:plus"
            tProps={{
              item: t('items.book')
            }}
            onClick={() => {}}
          >
            new
          </Button>
        }
      >
        {items}
      </ContextMenu>
    )
  }

  return (
    <FAB
      menuProps={{
        componentProps: {
          menu: { minWidth: '18em' }
        },
        zIndex: '50'
      }}
      visibilityBreakpoint="md"
    >
      {items}
    </FAB>
  )
}

export default BookCreationMenu
