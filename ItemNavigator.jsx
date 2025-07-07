import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { IconPanelNext, IconPanelPrev } from "@wf-wfria/pioneer-core";
import { Button } from "@wf-wfria/pioneer-core";
import { ItemNavigator } from "@wf-wfria/pioneer-core";
import {
    DisclosureList,
    DisclosureListContainer,
    DisclosureListItem,
    ThemeProvider
} from "@wf-wfria/pioneer-core";
import { ItemRecordDTO } from '../model/ItemRecordDTO';
import { UOWFileDetailsDTO } from '../model/UOWFileDetailsDTO';
import CheckImage from './check-image/check-image';

export function ItemProcessingBase() {
    const location = useLocation();
    const rowData: UOWFileDetailsDTO = location?.state?.rowData;
    const flatData: ItemRecordDTO[] = location?.state?.apiData;
    const formattedName = "..." + rowData?.name?.match(/\D\d{6}_T\d{6}/)?.[0] + "..." + rowData?.segmentId;

    const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
    const [renderedContent, setRenderedContent] = React.useState<any>("Loading...");

    const fetchImageData = async (imageSide: string, id: string): Promise<Blob | undefined> => {
        try {
            const url = `https://chimg-image-service-aks-sbox.cluster002.aks-scus-s.k8s.wellsfargo.net/api/v2/check-images/${id}/${imageSide}/PNG`;
            const response = await fetch(url);
            if (response.ok) {
                return await response.blob();
            }
        } catch (error) {
            console.error("Image fetch error", error);
        }
    };

    const loadImage = async (index: number) => {
        if (index < 0 || index >= flatData.length) return;
        const item = flatData[index];
        const frontBlob = await fetchImageData("Front", item.responseRecordDTO.id);
        const backBlob = await fetchImageData("Back", item.responseRecordDTO.id);
        item.frontImg = frontBlob ?? new Blob();
        item.backImg = backBlob ?? new Blob();
        setRenderedContent(<CheckImage key={`item-${item.id}`} item={item} />);
    };

    React.useEffect(() => {
        if (flatData?.length > 0) {
            loadImage(selectedIndex);
        }
    }, [selectedIndex]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                setSelectedIndex((prev) => Math.min(prev + 1, flatData.length - 1));
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [flatData]);

    return (
        <ThemeProvider baseTheme="common">
            <div style={{ display: "flex" }}>
                <div
                    style={{ width: "5%", background: "#eee", cursor: "pointer" }}
                    onMouseEnter={() => setSelectedIndex((prev) => Math.max(prev - 1, 0))}
                />
                <DisclosureListContainer
                    spacing={{ top: 0, right: 0, bottom: 0, left: 0 }}
                    header={rowData?.name?.split('.')[0] || 'Default Title'}
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
                                prevTrigger={
                                    <Button
                                        size="large"
                                        kind="standard"
                                        onClick={() => setSelectedIndex((prev) => Math.max(prev - 1, 0))}
                                        centerIcon={<IconPanelPrev size="small" />}
                                    />
                                }
                                nextTrigger={
                                    <Button
                                        size="large"
                                        kind="standard"
                                        onClick={() => setSelectedIndex((prev) => Math.min(prev + 1, flatData.length - 1))}
                                        centerIcon={<IconPanelNext size="small" />}
                                    />
                                }
                            />
                        }
                    >
                        {(flatData || []).map((item, index) => (
                            <DisclosureListItem
                                key={item.id}
                                id={item.id}
                                index={index}
                                itemId={item.id}
                                label={item.sequenceNumber || 'Default Label'}
                                aria-label={`item-viewer-container-${item.id}`}
                            />
                        ))}
                    </DisclosureList>
                </DisclosureListContainer>
                <div style={{ flexGrow: 1, marginLeft: "10px" }}>{renderedContent}</div>
            </div>
        </ThemeProvider>
    );
}

export default function ItemProcessing() {
    return <ItemProcessingBase />;
}
