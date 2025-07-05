import * as React from 'react';
import { useLocation } from 'react-router-dom';
import {
  IconPanelNext,
  IconPanelPrev,
  Button,
  ItemNavigator,
  DisclosureList,
  DisclosureListContainer,
  DisclosureListItem,
  ThemeProvider
} from '@wf-wfria/pioneer-core';

import { ItemRecordDTO } from '../model/ItemRecordDTO';
import { UOWFileDetailsDTO } from '../model/UOWFileDetailsDTO';
import CheckImage from './check-image/check-image';

export default function ItemProcessing() {
  const location = useLocation();
  const rowData: UOWFileDetailsDTO = location?.state?.rowData;
  const flatData: ItemRecordDTO[] = location?.state?.apiData || [];

  const formattedName =
    '...' +
    (rowData?.name?.match(/\D\d{6}_T\d{6}/)?.[0] ?? '') +
    '...' +
    rowData?.segmentId;

  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  const [currentItem, setCurrentItem] = React.useState<ItemRecordDTO | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    if (flatData.length) {
      setSelectedIndex(0);
    }
  }, [flatData]);

  React.useEffect(() => {
    if (flatData[selectedIndex]) {
      loadItem(flatData[selectedIndex]);
    }
  }, [selectedIndex]);

  async function fetchImageData(
    imageSide: 'Front' | 'Back',
    id: string
  ): Promise<Blob | undefined> {
    const url = `https://chimg-image-service-aks-sbox.cluster002.aks-scus-s.k8s.wellsfargo.net/api/v2/check-images/${id}/${imageSide}/PNG`;
    try {
      const res = await fetch(url);
      if (res.ok) return res.blob();
      console.error('Fetch error:', res.status);
    } catch (e) {
      console.error('Network error:', e);
    }
  }

  async function loadItem(item: ItemRecordDTO) {
    setLoading(true);
    setError(undefined);

    try {
      const frontBlob = await fetchImageData('Front', item.responseRecordDTO.id);
      const backBlob = await fetchImageData('Back', item.responseRecordDTO.id);
      item.frontImg = frontBlob ?? new Blob();
      item.backImg = backBlob ?? new Blob();
      setCurrentItem({ ...item });
    } catch {
      setError('Failed to load images');
    } finally {
      setLoading(false);
    }
  }

  const goPrev = () =>
    setSelectedIndex(idx => Math.max(0, idx - 1));
  const goNext = () =>
    setSelectedIndex(idx => Math.min(flatData.length - 1, idx + 1));

  return (
    <ThemeProvider baseTheme="common">
      <DisclosureListContainer
        spacing={{ top: 0, right: 0, bottom: 0, left: 0 }}
        header={rowData?.name.split('.')[0] || 'Default Title'}
        height="760px"
      >
        <DisclosureList
          defaultSelectedIndex={0}
          defaultExpanded
          title={formattedName || 'Default Title'}
          footer={
            <ItemNavigator
              totalItems={flatData.length}
              currentIndex={selectedIndex}
              onPrev={goPrev}
              onNext={goNext}
            />
          }
        >
          {(flatData || []).map((item, index) => (
            <DisclosureListItem
              key={item.id}
              id={item.id}
              index={index}
              itemId={item.id}
              label={item.sequenceNumber || 'Item ' + (index + 1)}
              aria-label={`item-${item.id}`}
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </DisclosureList>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          {loading && <p>Loading images…</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && !error && currentItem && (
            <CheckImage
              key={`item-viewer-container-${selectedIndex}`}
              item={currentItem}
            />
          )}
        </div>
      </DisclosureListContainer>
    </ThemeProvider>
  );
}
