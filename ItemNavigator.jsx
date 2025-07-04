import React, { useState, useEffect } from "react";

const ItemNavigator = () => {
  const items = ["85645409", "85645415","8564541555"];
  const rightPanelContent = {
    "85645409": "Details about item 85645409. This might be an order, record, or data block.",
    "85645415": "Details about item 85645415. Different content is shown for each item.",
    "85645416": "Details about item 856454156 Different content is shown for each item.",
  };

  const [currentIndex, setCurrentIndex] = useState(0);

  const goLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goRight = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Keyboard arrow key support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goLeft();
      if (e.key === "ArrowRight") goRight();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  return (
    <div
      style={{
        display: "flex",
        padding: "20px",
        fontFamily: "sans-serif",
        gap: "30px",
      }}
    >
      {/* Left Panel */}
      <div style={{ width: "200px", textAlign: "center" }}>
        <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "10px" }}>
          ...D030401_T140006...0
        </div>

        {items.map((item, index) => (
          <div
            key={item}
            style={{
              padding: "8px",
              border: index === currentIndex ? "2px solid #333" : "1px solid transparent",
              marginBottom: "5px",
              backgroundColor: index === currentIndex ? "#f0f0f0" : "#fff",
              cursor: "pointer",
            }}
            onClick={() => setCurrentIndex(index)}
          >
            {item}
          </div>
        ))}

        <div style={{ marginTop: "10px", fontSize: "14px" }}>
          {`${currentIndex + 1} of ${items.length} items`}
        </div>

        <div style={{ marginTop: "10px" }}>
          <button onClick={goLeft} disabled={currentIndex === 0}>
            ←
          </button>
          <button
            onClick={goRight}
            disabled={currentIndex === items.length - 1}
            style={{ marginLeft: "10px" }}
          >
            →
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div
        style={{
          flex: 1,
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "20px",
          backgroundColor: "#fafafa",
        }}
      >
        <h3>Item Details</h3>
        <p>{rightPanelContent[items[currentIndex]]}</p>
      </div>
    </div>
  );
};

export default ItemNavigator;
