import * as React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Button,
  IconPanelNext,
  IconPanelPrev,
  ThemeProvider
} from "@wf-wfria/pioneer-core";
import CheckImage from './check-image/check-image';
import { ItemRecordDTO } from '../model/ItemRecordDTO';
import { UOWFileDetailsDTO } from '../model/UOWFileDetailsDTO';

export function ItemProcessingBase() {
  const location = useLocation();
  const rowData: UOWFileDetailsDTO = location?.state?.rowData;
  const flatData: ItemRecordDTO[] = location?.state?.apiData;

  // Derive the “...D030401_T140006...0” style header
  const formattedName = "…" +
    rowData?.name?.match(/\D\d{6}_T\d{6}/)?.[0] +
    "…" + rowData?.segmentId;

  // Track which item is current
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  // Store fetched blobs on the fly
  const [blobs, setBlobs] = React.useState<
    { front: Blob; back: Blob }[]
  >([]);

  React.useEffect(() => {
    // initialize blob array placeholders
    if (flatData?.length > 0) {
      setBlobs(flatData.map(() => ({ front: new Blob(), back: new Blob() })));
    }
  }, [flatData]);

  // Fetch PNG blob for a given side
  const fetchImageData = async (side: 'Front' | 'Back', id: string) => {
    const url = `https://.../check-images/${id}/${side}/PNG`;
    const resp = await fetch(url);
    return resp.ok ? resp.blob() : new Blob();
  };

  // Load images for a given index
  const loadItemImages = async (index: number) => {
    const item = flatData[index];
    if (!item) return;

    try {
      const [front, back] = await Promise.all([
        fetchImageData('Front', item.responseRecordDTO.id),
        fetchImageData('Back', item.responseRecordDTO.id)
      ]);
      setBlobs(bs =>
        bs.map((b, i) =>
          i === index ? { front, back } : b
        )
      );
    } catch {
      console.error(`Failed to load images for index ${index}`);
    }
  };

  // Handlers for prev/next
  const goPrev = () => {
    const prev = (selectedIndex - 1 + flatData.length) % flatData.length;
    setSelectedIndex(prev);
    loadItemImages(prev);
  };
  const goNext = () => {
    const next = (selectedIndex + 1) % flatData.length;
    setSelectedIndex(next);
    loadItemImages(next);
  };

  // On mount, load first item
  React.useEffect(() => {
    if (flatData.length) {
      loadItemImages(0);
    }
  }, [flatData]);

  if (!flatData?.length) {
    return <div>No items to display</div>;
  }

  const current = flatData[selectedIndex];
  const currentBlobs = blobs[selectedIndex] || { front: new Blob(), back: new Blob() };

  return (
    <ThemeProvider baseTheme="common">
      <div className="item-panel" style={{ padding: 16, width: 600 }}>
        {/* Header */}
        <h2>{formattedName || 'Untitled'}</h2>

        {/* Sequence numbers */}
        <div
          className="sequence-list"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            margin: '16px 0'
          }}
        >
          {flatData.map((item, idx) => (
            <span
              key={item.id}
              style={{
                fontSize: 18,
                fontWeight: idx === selectedIndex ? 'bold' : 'normal',
                opacity: idx === selectedIndex ? 1 : 0.6
              }}
            >
              {item.sequenceNumber}
            </span>
          ))}
        </div>

        {/* Image viewer */}
        <CheckImage
          key={`viewer-${current.id}`}
          item={{
            ...current,
            frontImg: currentBlobs.front,
            backImg: currentBlobs.back
          }}
        />

        {/* Pagination controls */}
        <div
          className="navigator"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 16
          }}
        >
          <Button
            size="large"
            kind="standard"
            spacing={{ l: 1, r: 1 }}
            centerIcon={<IconPanelPrev size="small" aria-hidden="true" />}
            onClick={goPrev}
            aria-label="Previous item"
          />
          <span style={{ margin: '0 12px' }}>
            {selectedIndex + 1} of {flatData.length} items
          </span>
          <Button
            size="large"
            kind="standard"
            spacing={{ l: 1, r: 1 }}
            centerIcon={<IconPanelNext size="small" aria-hidden="true" />}
            onClick={goNext}
            aria-label="Next item"
          />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default function ItemProcessing() {
  return <ItemProcessingBase />;
}
