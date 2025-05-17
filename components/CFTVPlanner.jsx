import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Circle, Line, Rect } from "react-konva";
import useImage from "use-image";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs"; // Instale: npm install exceljs

const DEFAULT_STAGE_WIDTH = 900;
const DEFAULT_STAGE_HEIGHT = 600;

const PlantImage = ({ src, stageWidth, stageHeight }) => {
  const [image] = useImage(src);
  const [imageProps, setImageProps] = useState({ width: 0, height: 0, scale: 1 });

  useEffect(() => {
    if (image) {
      const scaleX = (stageWidth * 0.9) / image.width;
      const scaleY = (stageHeight * 0.9) / image.height;
      const scale = Math.min(scaleX, scaleY);
      setImageProps({ width: image.width, height: image.height, scale });
    }
  }, [image, stageWidth, stageHeight]);

  if (!image) return null;

  return (
    <KonvaImage
      image={image}
      x={(stageWidth - imageProps.width * imageProps.scale) / 2}
      y={(stageHeight - imageProps.height * imageProps.scale) / 2}
      scaleX={imageProps.scale}
      scaleY={imageProps.scale}
    />
  );
};

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export default function CFTVPlanner() {
  const [plantImage, setPlantImage] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [dvrs, setDvrs] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [properties, setProperties] = useState({});
  const [cableType, setCableType] = useState("coaxial");
  const [cameraType, setCameraType] = useState("analog");
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [addingCamera, setAddingCamera] = useState(false);
  const stageRef = useRef(null);

  // Adicionar câmera (modo ativado pelo botão)
  const handleAddCamera = (e) => {
    if (!addingCamera) return;
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const id = cameras.length + 1;
    const angle = 0;

    setCameras([
      ...cameras,
      { id, x: pointerPosition.x, y: pointerPosition.y, angle, type: cameraType, model: "", resolution: "", observations: "" },
    ]);
    setAddingCamera(false);
  };

  const handleAddDvr = () => {
    const id = dvrs.length + 1;
    setDvrs([...dvrs, { id, x: 100 + id * 50, y: 100 + id * 50, observations: "" }]);
  };

  const handleSelectEquipment = (type, id) => {
    setSelectedEquipment({ type, id });
    if (type === "camera") {
      const cam = cameras.find((c) => c.id === id);
      setProperties(cam || {});
    } else if (type === "dvr") {
      const dvr = dvrs.find((d) => d.id === id);
      setProperties(dvr || {});
    }
  };

  const handlePropertiesChange = (field, value) => {
    setProperties({ ...properties, [field]: value });
    if (selectedEquipment) {
      if (selectedEquipment.type === "camera") {
        setCameras(
          cameras.map((c) =>
            c.id === selectedEquipment.id ? { ...c, [field]: value } : c
          )
        );
      } else if (selectedEquipment.type === "dvr") {
        setDvrs(
          dvrs.map((d) =>
            d.id === selectedEquipment.id ? { ...d, [field]: value } : d
          )
        );
      }
    }
  };

  const handleDragMove = (type, id, e) => {
    const { x, y } = e.target.position();
    if (type === "camera") {
      setCameras(
        cameras.map((c) => (c.id === id ? { ...c, x, y } : c))
      );
    } else if (type === "dvr") {
      setDvrs(
        dvrs.map((d) => (d.id === id ? { ...d, x, y } : d))
      );
    }
  };

  const connectCameraToDvr = (cameraId, dvrId) => {
    // evitar duplicatas
    if (
      connections.find(
        (conn) => conn.cameraId === cameraId && conn.dvrId === dvrId
      )
    )
      return;
    setConnections([...connections, { cameraId, dvrId }]);
  };

  const removeConnection = (cameraId, dvrId) => {
    setConnections(
      connections.filter(
        (conn) => !(conn.cameraId === cameraId && conn.dvrId === dvrId)
      )
    );
  };

  // Ao selecionar câmera, conectar automaticamente ao DVR mais próximo
  useEffect(() => {
    if (
      selectedEquipment &&
      selectedEquipment.type === "camera" &&
      dvrs.length > 0
    ) {
      const cam = cameras.find((c) => c.id === selectedEquipment.id);
      if (!cam) return;

      let minDist = Infinity;
      let closestDvrId = null;
      dvrs.forEach((dvr) => {
        const dist = distance(cam.x, cam.y, dvr.x, dvr.y);
        if (dist < minDist) {
          minDist = dist;
          closestDvrId = dvr.id;
        }
      });

      if (closestDvrId !== null) {
        connectCameraToDvr(cam.id, closestDvrId);
      }
    }
  // eslint-disable-next-line
  }, [selectedEquipment]);

  // Gerar lista de materiais dinâmica
  const generateMaterialList = () => {
    const list = [];
    const camCount = cameras.length;
    const dvrCount = dvrs.length;

    let cableMeters = 0;
    let connectors = 0;
    let powerSupplies = 0;

    cameras.forEach((cam) => {
      const connectedDvr = connections.find((c) => c.cameraId === cam.id);
      if (!connectedDvr) return;
      const dvr = dvrs.find((d) => d.id === connectedDvr.dvrId);
      if (!dvr) return;

      const dist = distance(cam.x, cam.y, dvr.x, dvr.y);
      cableMeters += dist;

      if (cam.type === "IP") {
        connectors += 2;
      } else if (cableType === "UTP") {
        connectors += 2;
      } else {
        connectors += 1;
      }
    });

    powerSupplies = Math.ceil(camCount / 6);

    if (camCount > 0) {
      list.push({
        item: `Câmera ${cameraType === "IP" ? "IP" : "Analógica"}`,
        quantity: camCount,
        unit: "un",
      });
    }
    if (dvrCount > 0) {
      list.push({ item: "DVR/NVR", quantity: dvrCount, unit: "un" });
    }
    if (cableMeters > 0) {
      list.push({
        item: cableType === "UTP" ? "Cabo UTP" : "Cabo coaxial RG59",
        quantity: Math.round(cableMeters),
        unit: "m",
      });
    }
    if (connectors > 0) {
      list.push({
        item:
          cameraType === "IP"
            ? "Conector RJ45"
            : cableType === "UTP"
            ? "Balun"
            : "Conector BNC",
        quantity: connectors,
        unit: "un",
      });
    }
    if (powerSupplies > 0) {
      list.push({ item: "Fonte 12V 10A", quantity: powerSupplies, unit: "un" });
    }

    return list;
  };

  // Exportar PDF (texto simples)
  const exportPDF = () => {
    let content = "Lista de Materiais CFTV\n\n";
    generateMaterialList().forEach(({ item, quantity, unit }) => {
      content += `${item}: ${quantity} ${unit}\n`;
    });
    const blob = new Blob([content], { type: "application/pdf" });
    saveAs(blob, "lista_materiais_cftv.pdf");
  };

  // Exportar Excel (usando exceljs)
  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Lista de Materiais");

    worksheet.columns = [
      { header: "Item", key: "item", width: 32 },
      { header: "Quantidade", key: "quantity", width: 14 },
      { header: "Unidade", key: "unit", width: 10 },
    ];

    generateMaterialList().forEach((row) => worksheet.addRow(row));
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "lista_materiais_cftv.xlsx");
  };

  // Upload planta baixa
  const handlePlantUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPlantImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCableTypeChange = (e) => setCableType(e.target.value);

  const handleCameraTypeChange = (e) => setCameraType(e.target.value);

  const renderConnections = () => {
    return connections.map(({ cameraId, dvrId }, idx) => {
      const cam = cameras.find((c) => c.id === cameraId);
      const dvr = dvrs.find((d) => d.id === dvrId);
      if (!cam || !dvr) return null;
      return (
        <Line
          key={"conn" + idx}
          points={[cam.x, cam.y, dvr.x, dvr.y]}
          stroke="purple"
          strokeWidth={2}
          dash={[4, 4]}
          onClick={() => removeConnection(cameraId, dvrId)}
          style={{ cursor: "pointer" }}
        />
      );
    });
  };

  return (
    <div className="flex flex-col p-4 h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4">
        Sistema Visual de Mapeamento CFTV
      </h1>

      {/* Upload e configurações */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2">
          Upload Planta Baixa:
          <input type="file" accept="image/*" onChange={handlePlantUpload} />
        </label>

        <label className="flex items-center gap-2">
          Tipo de Cabo:
          <select
            className="p-1 rounded border"
            value={cableType}
            onChange={handleCableTypeChange}
          >
            <option value="coaxial">Coaxial</option>
            <option value="UTP">UTP</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          Tipo de Câmera:
          <select
            className="p-1 rounded border"
            value={cameraType}
            onChange={handleCameraTypeChange}
          >
            <option value="analog">Analógica</option>
            <option value="IP">IP</option>
          </select>
        </label>

        <button
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          onClick={handleAddDvr}
        >
          Adicionar DVR
        </button>

        <button
          className={`bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 ${addingCamera ? "ring-2 ring-blue-400" : ""}`}
          onClick={() => setAddingCamera(true)}
        >
          {addingCamera ? "Clique na planta para adicionar" : "Adicionar Câmera"}
        </button>
      </div>

      {/* Stage do Konva */}
      <div
        className="flex-grow border border-gray-400 rounded overflow-hidden"
        style={{ minHeight: DEFAULT_STAGE_HEIGHT }}
        onClick={handleAddCamera}
      >
        <Stage
          width={DEFAULT_STAGE_WIDTH}
          height={DEFAULT_STAGE_HEIGHT}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          ref={stageRef}
          draggable
          onDragEnd={(e) => {
            setStagePosition({
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
          onWheel={(e) => {
            e.evt.preventDefault();
            const scaleBy = 1.05;
            const oldScale = stageScale;
            const pointer = stageRef.current.getPointerPosition();
            if (!pointer) return;

            const mousePointTo = {
              x: (pointer.x - stagePosition.x) / oldScale,
              y: (pointer.y - stagePosition.y) / oldScale,
            };

            const newScale =
              e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

            setStageScale(newScale);

            const newPos = {
              x: pointer.x - mousePointTo.x * newScale,
              y: pointer.y - mousePointTo.y * newScale,
            };
            setStagePosition(newPos);
          }}
        >
          <Layer>
            {plantImage && (
              <PlantImage
                src={plantImage}
                stageWidth={DEFAULT_STAGE_WIDTH}
                stageHeight={DEFAULT_STAGE_HEIGHT}
              />
            )}

            {/* Conexões */}
            {renderConnections()}

            {/* DVRs */}
            {dvrs.map((dvr) => (
              <Rect
                key={"dvr" + dvr.id}
                x={dvr.x}
                y={dvr.y}
                width={30}
                height={20}
                fill={
                  selectedEquipment?.type === "dvr" &&
                  selectedEquipment.id === dvr.id
                    ? "red"
                    : "darkred"
                }
                draggable
                onClick={() => handleSelectEquipment("dvr", dvr.id)}
                onDragMove={(e) => handleDragMove("dvr", dvr.id, e)}
              />
            ))}

            {/* Câmeras */}
            {cameras.map((cam) => (
              <React.Fragment key={"cam" + cam.id}>
                <Circle
                  x={cam.x}
                  y={cam.y}
                  radius={12}
                  fill={
                    selectedEquipment?.type === "camera" &&
                    selectedEquipment.id === cam.id
                      ? "blue"
                      : "dodgerblue"
                  }
                  draggable
                  onClick={() => handleSelectEquipment("camera", cam.id)}
                  onDragMove={(e) => handleDragMove("camera", cam.id, e)}
                />
                <Line
                  points={[
                    cam.x,
                    cam.y,
                    cam.x + 30 * Math.cos(cam.angle || 0),
                    cam.y + 30 * Math.sin(cam.angle || 0),
                  ]}
                  stroke="rgba(0,0,255,0.5)"
                  strokeWidth={3}
                />
              </React.Fragment>
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Painel de propriedades e lista de materiais */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-auto max-h-96">
        <div className="p-4 border rounded bg-white dark:bg-gray-800 shadow">
          <h2 className="font-bold mb-3">Propriedades do Equipamento</h2>
          {selectedEquipment ? (
            <>
              {selectedEquipment.type === "camera" && (
                <>
                  <label className="block mb-2">
                    Modelo:
                    <input
                      type="text"
                      className="w-full border rounded p-1"
                      value={properties.model || ""}
                      onChange={(e) =>
                        handlePropertiesChange("model", e.target.value)
                      }
                    />
                  </label>
                  <label className="block mb-2">
                    Tipo:
                    <select
                      className="w-full border rounded p-1"
                      value={properties.type || ""}
                      onChange={(e) =>
                        handlePropertiesChange("type", e.target.value)
                      }
                    >
                      <option value="analog">Analógica</option>
                      <option value="IP">IP</option>
                    </select>
                  </label>
                  <label className="block mb-2">
                    Resolução:
                    <input
                      type="text"
                      className="w-full border rounded p-1"
                      value={properties.resolution || ""}
                      onChange={(e) =>
                        handlePropertiesChange("resolution", e.target.value)
                      }
                    />
                  </label>
                  <label className="block mb-2">
                    Observações:
                    <textarea
                      className="w-full border rounded p-1"
                      value={properties.observations || ""}
                      onChange={(e) =>
                        handlePropertiesChange("observations", e.target.value)
                      }
                      rows={3}
                    />
                  </label>
                </>
              )}
              {selectedEquipment.type === "dvr" && (
                <>
                  <label className="block mb-2">
                    Observações:
                    <textarea
                      className="w-full border rounded p-1"
                      value={properties.observations || ""}
                      onChange={(e) =>
                        handlePropertiesChange("observations", e.target.value)
                      }
                      rows={3}
                    />
                  </label>
                </>
              )}
            </>
          ) : (
            <p>Selecione uma câmera ou DVR para editar propriedades.</p>
          )}

          <hr className="my-3" />

          <h2 className="font-bold mb-2">Lista de Materiais</h2>
          <ul className="list-disc list-inside mb-4 max-h-48 overflow-auto">
            {generateMaterialList().map(({ item, quantity, unit }, idx) => (
              <li key={idx}>
                {item}: {quantity} {unit}
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <button
              className="flex-grow bg-purple-600 text-white py-1 rounded hover:bg-purple-700"
              onClick={exportPDF}
            >
              Exportar PDF
            </button>
            <button
              className="flex-grow bg-indigo-600 text-white py-1 rounded hover:bg-indigo-700"
              onClick={exportExcel}
            >
              Exportar Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}