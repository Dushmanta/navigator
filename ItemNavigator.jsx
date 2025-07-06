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
  const flatData: ItemRecordDTO[] = location?.state?.apiData ?? [];

  const formattedName = "…" +
    rowData?.name?.match(/\D\d{6}_T\d{6}/)?.[0] +
    "…" + rowData?.segmentId;

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [blobs, setBlobs] = React.useState<{ front: Blob; back: Blob }[]>([]);

  React.useEffect(() => {
    // Initialize blob slots
    if (flatData.length > 0) {
      setBlobs(flatData.map(() => ({ front: new Blob(), back: new Blob() })));
    }
  }, [flatData]);

  const fetchImageData = async (side: 'Front' | 'Back', id: string) => {
    const url = `https://.../check-images/${id}/${side}/PNG`;
    const resp = await fetch(url);
    return resp.ok ? resp.blob() : new Blob();
  };

  const loadItemImages = async (index: number) => {
    const item = flatData[index];
    if (!item) return;
    try {
      const [front, back] = await Promise.all([
        fetchImageData('Front', item.responseRecordDTO.id),
        fetchImageData('Back', item.responseRecordDTO.id)
      ]);
      setBlobs(prev =>
        prev.map((entry, i) => (i === index ? { front, back } : entry))
      );
    } catch (err) {
      console.error(`Image load error:`, err);
    }
  };

  const goToIndex = (index: number) => {
    if (index >= 0 && index < flatData.length) {
      setSelectedIndex(index);
      loadItemImages(index);
    }
  };

  const goPrev = () => goToIndex(selectedIndex - 1);
  const goNext = () => goToIndex(selectedIndex + 1);

  // Load first item
  React.useEffect(() => {
    if (flatData.length) {
      loadItemImages(0);
    }
  }, [flatData]);

  // Enable keyboard navigation
  React.useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && selectedIndex > 0) goPrev();
      if (e.key === 'ArrowRight' && selectedIndex < flatData.length - 1) goNext();
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [selectedIndex, flatData]);

  if (!flatData.length) return <div>No items available.</div>;

  const current = flatData[selectedIndex];
  const currentBlobs = blobs[selectedIndex] || { front: new Blob(), back: new Blob() };

  return (
    <ThemeProvider baseTheme="common">
      <div style={{ padding: 16, width: 600 }}>
        <h2>{formattedName || 'Untitled'}</h2>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          marginBottom: 16
        }}>
          {flatData.map((item, idx) => (
            <span
              key={item.id}
              style={{
                fontWeight: idx === selectedIndex ? 'bold' : 'normal',
                opacity: idx === selectedIndex ? 1 : 0.6,
                fontSize: 18
              }}
            >
              {item.sequenceNumber}
            </span>
          ))}
        </div>

        <CheckImage
          key={`viewer-${current.id}`}
          item={{
            ...current,
            frontImg: currentBlobs.front,
            backImg: currentBlobs.back
          }}
        />

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 20
        }}>
          <Button
            size="large"
            kind="standard"
            disabled={selectedIndex === 0}
            spacing={{ l: 1, r: 1 }}
            centerIcon={<IconPanelPrev size="small" />}
            onClick={goPrev}
            aria-label="Previous item"
          />
          <span style={{ margin: '0 12px' }}>
            {selectedIndex + 1} of {flatData.length} items
          </span>
          <Button
            size="large"
            kind="standard"
            disabled={selectedIndex === flatData.length - 1}
            spacing={{ l: 1, r: 1 }}
            centerIcon={<IconPanelNext size="small" />}
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
