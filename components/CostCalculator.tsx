
import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  FileText,
  LayoutTemplate,
  Save
} from 'lucide-react';
import { Material, AppSettings, PurchasingData, PdfSettings } from '../types';
import { fmt, costTranslations } from '../constants';

// Import Advanced Components
import ModelInfo from './ModelInfo';
import MaterialsList from './MaterialsList';
import SettingsPanel from './SettingsPanel';
import OrderSimulation from './OrderSimulation';
import TicketView from './TicketView';
import A4DocumentView from './A4DocumentView';
import PdfSettingsModal from './PdfSettingsModal';

interface CostCalculatorProps {
  initialArticleName: string;
  initialTotalTime: number;
  initialImage?: string | null;
  initialDate?: string;
  initialCostMinute?: number;
}

export default function CostCalculator({ initialArticleName, initialTotalTime, initialImage, initialDate, initialCostMinute }: CostCalculatorProps) {
  const [lang, setLang] = useState<'fr' | 'dr'>('fr');
  const [currency, setCurrency] = useState('DH');
  // Dark mode defaults to false and no toggle is exposed in UI
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'ticket' | 'a4'>('ticket');
  
  const t = costTranslations[lang];

  // --- MODEL INFO STATE ---
  // Initialize with prop, fallback to empty string if not provided (avoids "Test" or "Nouvel Article")
  const [productName, setProductName] = useState(initialArticleName || '');
  const [launchDate, setLaunchDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [baseTime, setBaseTime] = useState(initialTotalTime || 0);
  const [productImage, setProductImage] = useState<string | null>(initialImage || null);

  // --- SETTINGS STATE ---
  const [settings, setSettings] = useState<AppSettings>({
    costMinute: initialCostMinute || 1.50,
    useCostMinute: true, // Default to calculating labor cost
    cutRate: 10,
    packRate: 10,
    marginAtelier: 20,
    tva: 20,
    marginBoutique: 30
  });
  // Temp settings for the inputs before "Apply" (used for text input state)
  const [tempSettings, setTempSettings] = useState<AppSettings>(settings);

  // --- SYNC EFFECTS (LINKING PAGES) ---
  
  // 1. Sync Name
  useEffect(() => {
      setProductName(initialArticleName || '');
  }, [initialArticleName]);

  // 2. Sync Time
  useEffect(() => {
      if(initialTotalTime > 0) setBaseTime(initialTotalTime);
  }, [initialTotalTime]);

  // 3. Sync Image
  useEffect(() => {
      if(initialImage) setProductImage(initialImage);
  }, [initialImage]);

  // 4. Sync Date
  useEffect(() => {
      if(initialDate) setLaunchDate(initialDate);
  }, [initialDate]);

  // 5. Sync Cost Minute
  useEffect(() => {
      if(initialCostMinute !== undefined) {
          setSettings(prev => ({...prev, costMinute: initialCostMinute}));
          setTempSettings(prev => ({...prev, costMinute: initialCostMinute}));
      }
  }, [initialCostMinute]);

  // --- MATERIALS STATE (CLEAN - NO TEST DATA) ---
  const [materials, setMaterials] = useState<Material[]>([]);

  // --- SIMULATION STATE ---
  const [orderQty, setOrderQty] = useState(100); 
  const [wasteRate, setWasteRate] = useState(5); 

  // --- PDF & DOC STATE ---
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isLibLoaded, setIsLibLoaded] = useState(false);
  const [pdfSettings, setPdfSettings] = useState<PdfSettings>({
    orientation: 'portrait',
    colorMode: 'color',
    scale: 1
  });
  
  // Doc Fields
  const [displayDate, setDisplayDate] = useState(new Date().toLocaleDateString('fr-FR'));
  const [docRef, setDocRef] = useState(`REF-${new Date().getFullYear()}-${Math.floor(Math.random()*1000)}`);
  const [companyName, setCompanyName] = useState('MBERATEX CONFECTION');
  const [companyAddress, setCompanyAddress] = useState('Zone Industrielle, Lot 123, Tanger, Maroc');
  const [companyLegal, setCompanyLegal] = useState('RC: 12345 | IF: 67890 | ICE: 00112233445566');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [docNotes, setDocNotes] = useState('');

  const docRefContainer = useRef<HTMLDivElement>(null);

  // Load html2pdf check
  useEffect(() => {
    const checkLib = setInterval(() => {
        if ((window as any).html2pdf) {
            setIsLibLoaded(true);
            clearInterval(checkLib);
        }
    }, 500);
    return () => clearInterval(checkLib);
  }, []);

  // --- CALCULATIONS ---
  const totalMaterials = materials.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  const cutTime = baseTime * (settings.cutRate / 100);
  const packTime = baseTime * (settings.packRate / 100);
  const totalTime = baseTime + cutTime + packTime;
  
  // LOGIC: If useCostMinute is true, calculate. Otherwise 0.
  const laborCost = settings.useCostMinute ? totalTime * settings.costMinute : 0;
  
  const costPrice = totalMaterials + laborCost; 
  const sellPriceHT = costPrice * (1 + settings.marginAtelier / 100); 
  const sellPriceTTC = sellPriceHT * (1 + settings.tva / 100); 
  const boutiquePrice = sellPriceTTC * (1 + settings.marginBoutique / 100); 

  const purchasingData: PurchasingData[] = materials.map(m => {
    const totalRaw = m.qty * orderQty;
    const totalWithWaste = totalRaw * (1 + wasteRate / 100);
    const qtyToBuy = (m.unit === 'bobine' || m.unit === 'pc') ? Math.ceil(totalWithWaste) : parseFloat(totalWithWaste.toFixed(2));
    const lineCost = qtyToBuy * m.unitPrice;
    return { ...m, totalRaw, totalWithWaste, qtyToBuy, lineCost };
  });

  const totalPurchasingMatCost = purchasingData.reduce((acc, item) => acc + item.lineCost, 0);

  // --- HANDLERS ---
  const handleInstantSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: Math.max(0, parseFloat(value) || 0) }));
  };

  const handleTempSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTempSettings(prev => ({ ...prev, [name]: Math.max(0, parseFloat(value) || 0) }));
  };

  // Toggles the calculation method and updates the value if changed
  const toggleCostMinute = () => {
    setSettings(prev => ({ 
        ...prev, 
        costMinute: tempSettings.costMinute, // Ensure latest value is used
        useCostMinute: !prev.useCostMinute 
    }));
  };

  const addMaterial = () => {
    const newId = materials.length > 0 ? Math.max(...materials.map(m => m.id)) + 1 : 1;
    setMaterials([...materials, { id: newId, name: '', unitPrice: 0, qty: 1, unit: 'pc', threadMeters: 0, threadCapacity: 0 }]);
  };

  const updateMaterial = (id: number, field: string, value: string | number) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const deleteMaterial = (id: number) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCompanyLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generatePDF = async (action: 'save' | 'preview') => {
    if (!docRefContainer.current || !(window as any).html2pdf) return;
    setIsGeneratingPdf(true);

    const element = docRefContainer.current;
    const opt = {
      margin: [0, 0, 0, 0],
      filename: `${productName.replace(/\s+/g, '_') || 'Article'}_${viewMode}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: pdfSettings.orientation }
    };

    try {
        if (action === 'save') {
            await (window as any).html2pdf().set(opt).from(element).save();
        }
    } catch (err) {
        console.error("PDF Error:", err);
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  // --- THEME CONSTANTS ---
  const bgMain = darkMode ? 'bg-gray-900' : 'bg-slate-50';
  const textPrimary = darkMode ? 'text-white' : 'text-slate-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-slate-500';
  const bgCard = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200';
  const bgCardHeader = darkMode ? 'bg-gray-750 border-gray-700' : 'bg-slate-50 border-slate-100';
  const inputBg = darkMode ? 'bg-gray-700 border-gray-600 text-white focus:bg-gray-600' : 'bg-white border-slate-300 text-slate-900 focus:bg-white';
  const tableHeader = darkMode ? 'bg-gray-750 text-gray-400' : 'bg-slate-50 text-slate-500';
  const tableRowHover = darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50';

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-20 ${bgMain}`}>
      
      <div className="w-full mx-auto px-4 md:px-6 pt-4 space-y-6">
        
        {/* FULL WIDTH MODEL INFO */}
        <ModelInfo 
            t={t} currency={currency} darkMode={darkMode}
            productName={productName} setProductName={setProductName}
            launchDate={launchDate} setLaunchDate={setLaunchDate}
            baseTime={baseTime} setBaseTime={setBaseTime}
            totalTime={totalTime} settings={settings} setSettings={setSettings}
            tempSettings={tempSettings} setTempSettings={setTempSettings}
            productImage={productImage} setProductImage={setProductImage}
            toggleCostMinute={toggleCostMinute}
            handleInstantSettingChange={handleInstantSettingChange}
            handleTempSettingChange={handleTempSettingChange}
            inputBg={inputBg} textPrimary={textPrimary} textSecondary={textSecondary}
            bgCard={bgCard} bgCardHeader={bgCardHeader}
        />

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: MATERIALS & SETTINGS */}
            <div className="xl:col-span-7 space-y-6">
                
                <MaterialsList 
                    t={t} currency={currency} darkMode={darkMode}
                    materials={materials} addMaterial={addMaterial}
                    updateMaterial={updateMaterial} deleteMaterial={deleteMaterial}
                    totalMaterials={totalMaterials}
                    bgCard={bgCard} bgCardHeader={bgCardHeader}
                    textPrimary={textPrimary} textSecondary={textSecondary}
                    tableHeader={tableHeader} tableRowHover={tableRowHover}
                />

                <SettingsPanel 
                    t={t} darkMode={darkMode}
                    settings={settings} handleChange={handleInstantSettingChange}
                    bgCard={bgCard} bgCardHeader={bgCardHeader}
                    textPrimary={textPrimary} textSecondary={textSecondary}
                    inputBg={inputBg}
                />

                <OrderSimulation 
                    t={t} currency={currency} darkMode={darkMode}
                    orderQty={orderQty} setOrderQty={setOrderQty}
                    wasteRate={wasteRate} setWasteRate={setWasteRate}
                    purchasingData={purchasingData}
                    totalPurchasingMatCost={totalPurchasingMatCost}
                    laborCost={laborCost}
                    textSecondary={textSecondary} textPrimary={textPrimary}
                    bgCard={bgCard}
                />

            </div>

            {/* RIGHT COLUMN: PREVIEW */}
            <div className="xl:col-span-5 space-y-6 sticky top-6">
                
                {/* MOVED HEADER BANNER HERE - CONTROL PANEL FOR TICKET */}
                <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden p-6 flex flex-col gap-6 relative">
                    <div className="relative z-10">
                        <h1 className="text-2xl font-black tracking-tight text-white mb-1">Coûts & Budget</h1>
                        <p className="text-slate-400 font-medium text-sm">Calculateur Industriel & Simulation</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
                        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 w-full sm:w-auto">
                            <button onClick={() => setViewMode('ticket')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${viewMode === 'ticket' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                <FileText className="w-4 h-4" /> Ticket
                            </button>
                            <button onClick={() => setViewMode('a4')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${viewMode === 'a4' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                <LayoutTemplate className="w-4 h-4" /> A4 Doc
                            </button>
                        </div>
                        <button onClick={() => setShowPdfModal(true)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 transition active:scale-95 border border-indigo-500/50">
                            <Printer className="w-4 h-4" />
                            <span>Imprimer / PDF</span>
                        </button>
                    </div>

                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-900 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
                </div>

                {viewMode === 'ticket' ? (
                    <TicketView 
                        t={t} currency={currency} darkMode={darkMode}
                        productName={productName} displayDate={displayDate}
                        totalMaterials={totalMaterials} totalTime={totalTime}
                        laborCost={laborCost} costPrice={costPrice}
                        settings={settings} productImage={productImage}
                        textPrimary={textPrimary} textSecondary={textSecondary}
                        materials={materials} cutTime={cutTime} packTime={packTime}
                        sellPriceHT={sellPriceHT} sellPriceTTC={sellPriceTTC}
                        boutiquePrice={boutiquePrice}
                        launchDate={launchDate}
                    />
                ) : (
                    <div className="border rounded-xl shadow-lg overflow-hidden transform scale-[0.6] origin-top-center bg-white">
                        <A4DocumentView 
                            t={t} currency={currency} darkMode={false} 
                            productName={productName} displayDate={displayDate} setDisplayDate={setDisplayDate}
                            docRef={docRef} setDocRef={setDocRef}
                            companyName={companyName} setCompanyName={setCompanyName}
                            companyAddress={companyAddress} setCompanyAddress={setCompanyAddress}
                            companyLegal={companyLegal} setCompanyLegal={setCompanyLegal}
                            companyLogo={companyLogo} handleLogoUpload={handleLogoUpload}
                            baseTime={baseTime} totalTime={totalTime} settings={settings}
                            productImage={productImage} materials={materials}
                            laborCost={laborCost} costPrice={costPrice}
                            sellPriceHT={sellPriceHT} sellPriceTTC={sellPriceTTC} boutiquePrice={boutiquePrice}
                            orderQty={orderQty} wasteRate={wasteRate}
                            purchasingData={purchasingData} totalPurchasingMatCost={totalPurchasingMatCost}
                            docNotes={docNotes} setDocNotes={setDocNotes}
                        />
                        <div className="absolute inset-0 z-10 cursor-not-allowed"></div>
                    </div>
                )}

            </div>
        </div>
      </div>

      {/* PDF MODAL */}
      <PdfSettingsModal 
        t={t} darkMode={darkMode}
        showPdfModal={showPdfModal} setShowPdfModal={setShowPdfModal}
        isGeneratingPdf={isGeneratingPdf} isLibLoaded={isLibLoaded}
        pdfSettings={pdfSettings} setPdfSettings={setPdfSettings}
        generatePDF={generatePDF}
      >
         {viewMode === 'ticket' ? (
             <div ref={docRefContainer} className="bg-white text-slate-900 p-8 w-full h-full">
                 <TicketView 
                    t={t} currency={currency} darkMode={false}
                    productName={productName} displayDate={displayDate}
                    totalMaterials={totalMaterials} totalTime={totalTime}
                    laborCost={laborCost} costPrice={costPrice}
                    settings={settings} productImage={productImage}
                    textPrimary="text-slate-900" textSecondary="text-slate-500"
                    materials={materials} cutTime={cutTime} packTime={packTime}
                    sellPriceHT={sellPriceHT} sellPriceTTC={sellPriceTTC}
                    boutiquePrice={boutiquePrice}
                    launchDate={launchDate}
                />
             </div>
         ) : (
             <A4DocumentView 
                ref={docRefContainer}
                t={t} currency={currency} darkMode={false}
                productName={productName} displayDate={displayDate} setDisplayDate={setDisplayDate}
                docRef={docRef} setDocRef={setDocRef}
                companyName={companyName} setCompanyName={setCompanyName}
                companyAddress={companyAddress} setCompanyAddress={setCompanyAddress}
                companyLegal={companyLegal} setCompanyLegal={setCompanyLegal}
                companyLogo={companyLogo} handleLogoUpload={handleLogoUpload}
                baseTime={baseTime} totalTime={totalTime} settings={settings}
                productImage={productImage} materials={materials}
                laborCost={laborCost} costPrice={costPrice}
                sellPriceHT={sellPriceHT} sellPriceTTC={sellPriceTTC} boutiquePrice={boutiquePrice}
                orderQty={orderQty} wasteRate={wasteRate}
                purchasingData={purchasingData} totalPurchasingMatCost={totalPurchasingMatCost}
                docNotes={docNotes} setDocNotes={setDocNotes}
            />
         )}
      </PdfSettingsModal>

    </div>
  );
}