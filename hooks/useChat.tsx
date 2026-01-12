import { useState, useEffect, useRef } from 'react';
import { Message } from '../types/chat';
import { fetchPageSpeedData, processPageSpeedData } from '../utils/pageSpeed';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [waitingFor, setWaitingFor] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [errorCount, setErrorCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(0);

  const getUniqueId = () => {
    messageIdCounter.current += 1;
    return `msg_${messageIdCounter.current}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Initial sequence
    const init = async () => {
      const status = process.env.NEXT_PUBLIC_STATUS_APP;
      if (status === 'OFFLINE') {
        setMessages([
          {
            id: getUniqueId(),
            role: 'assistant',
            content: 'Sistem sedang offline.',
            type: 'text'
          },
           {
            id: getUniqueId(),
            role: 'assistant',
            content: 'Mohon maaf atas ketidaknyamanannya. Silakan coba lagi nanti atau hubungi kami untuk informasi lebih lanjut.',
            type: 'text'
          }
        ]);
        return;
      }

      setIsTyping(true);
      await new Promise(r => setTimeout(r, 1000));
      setMessages([
        {
          id: getUniqueId(),
          role: 'assistant',
          content: 'Halo! Saya asisten AI Anda. Saya bisa membantu Anda menganalisis performa dan kualitas website Anda.',
          type: 'text'
        }
      ]);

      await new Promise(r => setTimeout(r, 800));
      setMessages(prev => [...prev, {
        id: getUniqueId(),
        role: 'assistant',
        content: 'Silakan masukkan URL website yang ingin Anda analisis.',
        type: 'input'
      }]);
      setIsTyping(false);
    };
    init();
  }, []);

  const handleSendUrl = async (url: string) => {
    if (!url.trim()) return;

    const validatedUrl = url.startsWith('http') ? url : `https://${url}`;

    // Validate URL by attempting to fetch it
    try {
      await fetch(validatedUrl, { method: 'HEAD', mode: 'no-cors' });
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: getUniqueId(),
          role: 'assistant',
          content: 'URL tidak valid atau domain tidak dapat diakses. Silakan masukkan ulang URL atau domain yang valid.',
          type: 'input'
        }
      ]);
      return;
    }

    setCurrentUrl(validatedUrl);

    setMessages(prev => [
      ...prev,
      { id: getUniqueId(), role: 'user', content: validatedUrl, type: 'text' }
    ]);

    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: getUniqueId(),
          role: 'assistant',
          content: 'Bagus! Data apa yang ingin Anda lihat untuk website ini?',
          type: 'options',
          options: ['Audit Kualitas Website', 'Performance SEO Web Saya', 'Performance Brand di AI Search']
        }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleOptionSelect = async (option: string) => {
    setIsTyping(true);

    if (option === 'Audit Kualitas Website') {
      // Add temporary message
      const tempMessageId = getUniqueId();
      setMessages(prev => [
        ...prev,
        {
          id: tempMessageId,
          role: 'assistant',
          content: 'Proses memakan waktu 1-2 menit. Mohon tunggu...',
          type: 'text'
        }
      ]);

      // Fetch data from PageSpeed API
      const data = await fetchPageSpeedData(currentUrl);

      // Remove temporary message
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));

      if (data) {
        showResult(option, undefined, data);
      } else {
        // Handle error
        setMessages(prev => [
          ...prev,
          {
            id: getUniqueId(),
            role: 'assistant',
            content: 'Maaf, terjadi kesalahan saat mengambil data. Silakan coba lagi.',
            type: 'text'
          }
        ]);
      }
      setIsTyping(false);
    } else if (option === 'Lihat page berikutnya') {
      // Fetch next page
      setIsTyping(true);
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchQuery,
            page: searchPage
          })
        });
        const data = await response.json();
        if (response.ok) {
          const results = data.results.organic || [];
          const formattedResults = results.slice(0, 10).map((result: any) => 
            `${result.position}. **[${result.title}](${result.link})**\n${result.snippet}`
          ).join('\n\n');

          const isPresent = results.some((result: any) => {
            const resultDomain = new URL(result.link).hostname.replace('www.', '');
            const currentDomain = new URL(currentUrl).hostname.replace('www.', '');
            return resultDomain === currentDomain;
          });

          const content = `Berikut hasil pencarian untuk **"${searchQuery}"** (Google page Ke-${searchPage}):\n\n${formattedResults}`;

          setMessages(prev => [...prev, {
            id: getUniqueId(),
            role: 'assistant',
            content: content,
            type: 'text'
          }]);

          if (isPresent) {
            const foundResult = results.find((result: any) => {
              const resultDomain = new URL(result.link).hostname.replace('www.', '');
              const currentDomain = new URL(currentUrl).hostname.replace('www.', '');
              return resultDomain === currentDomain;
            });
            const position = foundResult.position;
            setMessages(prev => [...prev, {
              id: getUniqueId(),
              role: 'assistant',
              content: `Website Anda muncul di posisi ke-${position} pada hasil pencarian **"${searchQuery}"** di halaman Google.`,
              type: 'text'
            }]);
          } else {
            setMessages(prev => [...prev, {
              id: getUniqueId(),
              role: 'assistant',
              content: 'Website tidak ditemukan di halaman ini.',
              type: 'text'
            },
              {
              id: getUniqueId(),
              role: 'assistant',
              content: 'Konsultasikan lebih lanjut dengan kami jika Anda memerlukan bantuan untuk meningkatkan peringkat website Anda.',
              type: 'text'
            },
            {
              id: getUniqueId(),
              role: 'assistant',
              content: (
                <a
                  href="https://wa.me/628551162506?text=Halo,%20saya%20perlu%20bantuan%20untuk%20memperbaiki%20website%20saya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Hubungi Kami via WhatsApp
                </a>
              ),

              type: 'text'
            },
            {
            id: getUniqueId(),
            role: 'assistant',
            content: 'ingin melakukan pengecekan lainnya?',
            type: 'options'
          }]);
          }
        } else {
          setMessages(prev => [...prev, {
            id: getUniqueId(),
            role: 'assistant',
            content: 'Maaf, terjadi kesalahan saat mengambil data pencarian.',
            type: 'text'
          }]);
        }
      } catch (error) {
        setMessages(prev => [...prev, {
          id: getUniqueId(),
          role: 'assistant',
          content: 'Maaf, terjadi kesalahan jaringan.',
          type: 'text'
        }]);
      }
      setIsTyping(false);
    } else {
      // For other options, keep the existing logic
      setTimeout(() => {
        if (option === 'Performance SEO Web Saya') {
          setWaitingFor('seo');
          setMessages(prev => [
            ...prev,
            {
              id: getUniqueId(),
              role: 'assistant',
              content: 'Untuk analisis SEO yang lebih akurat, apa keyword utama yang ingin Anda targetkan?',
              type: 'input'
            }
          ]);
        } else if (option === 'Performance Brand di AI Search') {
          setWaitingFor('brand');
          setMessages(prev => [
            ...prev,
            {
              id: getUniqueId(),
              role: 'assistant',
              content: 'Apa yang biasanya dicari konsumen tentang kategori brand Anda?',
              type: 'input'
            }
            ,{
            id: getUniqueId(),
            role: 'assistant',
            content: 'Contoh seperti "sepatu lari", "smartphone terbaru", atau "makanan sehat".',
            type: 'text'
          }
          ]);
        }
        setIsTyping(false);
      }, 1000);
    }
  };

  const showResult = (option: string, extraInfo?: string, data?: any) => {
    setIsTyping(true);
    setTimeout(() => {
      const { overallScore, performanceScore, seoScore, bestPracticesScore, accessibilityScore, issues } = processPageSpeedData(data);

      setMessages(prev => [
        ...prev,
        {
          id: getUniqueId(),
          role: 'assistant',
          content: (
            <div className="space-y-4">
              <p>Menganalisis <strong>{option}</strong> untuk {currentUrl}{extraInfo ? ` dengan fokus "${extraInfo}"` : ''}...</p>
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Analysis Report</span>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    COMPLETED
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800">Skor Keseluruhan: {overallScore}/100</h4>
            
                  {data && (
                    <div className="grid grid-cols-4 gap-4 text-xs">
                      {[
                        { label: 'Performance', score: performanceScore },
                        { label: 'SEO', score: seoScore },
                        { label: 'Best Practices', score: bestPracticesScore },
                        { label: 'Accessibility', score: accessibilityScore }
                      ].map((item, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2">
                          <div className="relative w-16 h-16">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#e2e8f0"
                                strokeWidth="3"
                              />
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="3"
                                strokeDasharray={`${item.score}, 100`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-semibold text-slate-800">{item.score}</span>
                            </div>
                          </div>
                          <span className="text-center font-medium text-slate-700">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {issues.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="font-semibold text-slate-800 text-sm">Masalah Ditemukan:</h5>
                      <div className="space-y-2">
                        {issues.map((issue, index) => (
                          <div key={index} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                              <div className="flex-1 overflow-auto">
                                <h6 className="font-medium text-slate-800 text-sm">{issue.title}</h6>
                                <p className="text-xs text-slate-600 mt-1">{issue.description}</p>
                                {issue.displayValue && (
                                  <p className="text-xs mt-1 font-medium">Nilai: {issue.displayValue}</p>
                                )}
                                {issue.details.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-slate-700">Solusi:</p>
                                    <ul className="text-xs text-slate-600 list-disc list-inside mt-1">
                                      {issue.details.slice(0, 3).map((item: any, idx: number) => (
                                        <li key={idx}>{item.snippet || item.url || item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ),
          type: 'result'
        }
      ]);
      setIsTyping(false);

      // If there are issues, add follow-up message with WhatsApp button
      if (issues.length > 0) {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: getUniqueId(),
              role: 'assistant',
              content: 'Jika Anda tidak bisa memperbaiki masalah ini, kami siap membantu!',
              type: 'text'
            },
            {
              id: getUniqueId(),
              role: 'assistant',
              content: (
                <a
                  href="https://wa.me/628551162506?text=Halo,%20saya%20perlu%20bantuan%20untuk%20memperbaiki%20website%20saya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Hubungi Kami via WhatsApp
                </a>
              ),

              type: 'text'
            },
             {
            id: getUniqueId(),
            role: 'assistant',
            content: 'ingin melakukan pengecekan lainnya?',
            type: 'options'
          },
            
          ]);
        }, 2000); // Delay after result
      }
    }, 1500);
  };

  const handleSendInput = async (val: string) => {
    if (!val.trim()) return;

    // Check for greeting keywords only if URL is already set
    if (currentUrl) {
      const greetingKeywords = ['halo', 'hai', 'hi', 'hello', 'selamat pagi', 'selamat siang', 'selamat malam', 'hey', 'apa kabar', 'bagaimana kabar','bantu'];
      if (greetingKeywords.some(keyword => val.toLowerCase().includes(keyword))) {
        setMessages(prev => [
          ...prev,
          { id: getUniqueId(), role: 'user', content: val, type: 'text' }
        ]);

        setIsTyping(true);
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: getUniqueId(),
              role: 'assistant',
              content: 'Halo! Bagaimana saya bisa membantu Anda hari ini?',
              type: 'options'
            }
          ]);
          setIsTyping(false);
        }, 1000);
        return;
      }
    }

    // Check if input matches any available options (always available if URL is set and not waiting)
    if (currentUrl && !waitingFor) {
      const optionKeywords: Record<string, string[]> = {
        'Audit Kualitas Website': ['audit', 'kualitas', 'analisis', 'quality', 'analisa', 'review', 'evaluasi', 'inspection', 'assessment', 'diagnosis', 'scan', 'examine', 'verify', 'validate', 'inspeksi', 'penilaian', 'diagnosis', 'pemeriksaan', 'validasi'],
        'Performance SEO Web Saya': ['seo','search', 'engine', 'optimization',  'ranking', 'peringkat', 'posisi', 'mesin', 'optimasi',  'serp', 'keyword', 'onpage', 'offpage', 'backlink', 'meta', 'title', 'description', 'mesin pencari', 'optimasi mesin pencari', 'peringkat google', 'seonya'],
        'Performance Brand di AI Search': ['brand', 'ai', 'search', 'intelligence', 'merek', 'produk', 'kecerdasan', 'buatan', 'artificial', 'machine', 'learning', 'visibility', 'analytics', 'powered', 'kecerdasan buatan', 'performa merek', 'pencarian ai']
      };

      let matchedOption: string | undefined;
      const inputWords = val.toLowerCase().trim().split(/\s+/);
      for (const [option, keywords] of Object.entries(optionKeywords)) {
        if (inputWords.some(word => keywords.includes(word))) {
          matchedOption = option;
          break;
        }
      }

      if (matchedOption) {
        // Add user message with original input
        setMessages(prev => [
          ...prev,
          { id: getUniqueId(), role: 'user', content: val, type: 'text' }
        ]);
        handleOptionSelect(matchedOption);
        return;
      }
    }

    // Check if we are waiting for URL or for extra info
    if (!currentUrl) {
      handleSendUrl(val);
    } else {
      // We already have a URL, so this must be extra info (keyword or brand)
      if (waitingFor === 'seo' || waitingFor === 'brand') {
        setMessages(prev => [
          ...prev,
          { id: getUniqueId(), role: 'user', content: val, type: 'text' }
        ]);

        if (waitingFor === 'seo') {
          setSearchQuery(val);
          setSearchPage(1);
          setIsTyping(true);
          try {
            const response = await fetch('/api/search', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: val,
                page: 1
              })
            });
            const data = await response.json();
       
            if (response.ok) {
              // Format the results
              const results = data.results.organic || [];
              const formattedResults = results.slice(0, 10).map((result: any) => 
                `${result.position}. **[${result.title}](${result.link})**\n${result.snippet}`
              ).join('\n\n');

              const isPresent = results.some((result: any) => {
                const resultDomain = new URL(result.link).hostname.replace('www.', '');
                const currentDomain = new URL(currentUrl).hostname.replace('www.', '');
                return resultDomain === currentDomain;
              });

              const content = `Berikut hasil pencarian untuk **"${val}"** (Google page Ke-${searchPage}):\n\n${formattedResults}`;
              setMessages(prev => [...prev, {
                id: getUniqueId(),
                role: 'assistant',
                content: content,
                type: 'text'
              }]);

              // Check if current URL is present
              if (isPresent) {
                const foundResult = results.find((result: any) => {
                  const resultDomain = new URL(result.link).hostname.replace('www.', '');
                  const currentDomain = new URL(currentUrl).hostname.replace('www.', '');
                  return resultDomain === currentDomain;
                });
                const position = foundResult.position;
                setMessages(prev => [...prev, {
                  id: getUniqueId(),
                  role: 'assistant',
                  content: `Website Anda muncul di posisi ke-${position} pada hasil pencarian **"${val}"** di halaman Google.`,
                  type: 'text'
                },{
            id: getUniqueId(),
            role: 'assistant',
            content: 'ingin melakukan pengecekan lainnya?',
            type: 'options'
          }]);
              } else {
                setMessages(prev => [...prev, {
                  id: getUniqueId(),
                  role: 'assistant',
                  content: 'Website tidak ditemukan di halaman 1. Lihat halaman berikutnya?',
                  type: 'options',
                  options: ['Lihat page berikutnya']
                }]);
                setSearchPage(2);
              }
            } else {
              setMessages(prev => [...prev, {
                id: getUniqueId(),
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan saat mengambil data pencarian. Silakan coba lagi.',
                type: 'text'
              }]);
            }
          } catch (error) {
            setMessages(prev => [...prev, {
              id: getUniqueId(),
              role: 'assistant',
              content: 'Maaf, terjadi kesalahan jaringan. Silakan coba lagi.',
              type: 'text'
            }]);
          }
          setIsTyping(false);
          setWaitingFor('');
        } else if (waitingFor === 'brand') {
          setIsTyping(true);
          try {
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messages: [
                  { role: 'system', content: 'Anda adalah asisten AI yang membantu menganalisis performa brand di AI Search.' },
                  { role: 'user', content: `Buat respons terstruktur untuk pencarian frase "${val}" dengan format seperti contoh berikut, tapi isi dengan data nyata berdasarkan pencarian Anda:

Berikut hasil pencarian dengan kata kunci <b>"${val}"</b> berdasarkan evaluasi dari berbagai sumber dan review pengguna di internet. Saya melakukan pencarian tanpa terpaku pada link yang Anda berikan, sehingga fokus utama adalah mencari [jenis pencarian] yang memang populer dan banyak direkomendasikan. Berikut informasi dan daftar 5 [jenis item] terbaik:

<b>[Nama Item 1]</b>
[Deskripsi panjang tentang item 1].

<b>[Nama Item 2]</b>
[Deskripsi panjang].

[Lanjutkan untuk 5 item]

<b>Catatan penting:</b>

[Catatan tentang website ${currentUrl} jika relevan].

Daftar di atas berdasarkan [sumber].

Jika fokus Anda adalah melakukan pengecekan performa website ${currentUrl} dalam konteks pencarian tersebut, maka [analisis posisi].

Semoga informasi ini membantu Anda dalam mengembangkan mesin pengecekan performa website di AI Search. Jika membutuhkan hasil analisis lebih mendalam.

Gunakan tag HTML sederhana seperti <b>, <i>, <a> untuk formatting, tapi jangan tampilkan tag di output - output harus sudah dirender.` }
                ]
              })
            });
            const data = await response.json();
            if (response.ok) {
              setMessages(prev => [...prev, {
                id: getUniqueId(),
                role: 'assistant',
                content: data.response,
                type: 'text'
              },
             {
            id: getUniqueId(),
            role: 'assistant',
            content: 'ingin melakukan pengecekan lainnya?',
            type: 'options'
          }]);
            } else {
              setMessages(prev => [...prev, {
                id: getUniqueId(),
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan saat menganalisis. Silakan coba lagi.',
                type: 'text'
              }]);
            }
          } catch (error) {
            setMessages(prev => [...prev, {
              id: getUniqueId(),
              role: 'assistant',
              content: 'Maaf, terjadi kesalahan jaringan. Silakan coba lagi.',
              type: 'text'
            }]);
          }
          setIsTyping(false);
          setWaitingFor('');
        }
      } else {
        // If not waiting for extra info
        setMessages(prev => [
          ...prev,
          { id: getUniqueId(), role: 'user', content: val, type: 'text' }
        ]);

        if (errorCount >= 2) {
          setIsTyping(true);
          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: getUniqueId(),
                role: 'assistant',
                content: 'Maaf, kami tidak bisa membantu permintaan Anda. Silakan pilih opsi analisis yang tersedia.',
                type: 'text'
              },
              {
                id: getUniqueId(),
                role: 'assistant',
                content:'apa yang ingin Anda lihat untuk website ini?',
                type: 'options'
              }
            ]);
            setIsTyping(false);
          }, 1000);
        } else {
          // Send to API chat
          setIsTyping(true);
          (async () => {
            try {
              const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  messages: [
                    { role: 'system', content: 'Anda adalah asisten AI yang membantu menganalisis performa website. Jawab pertanyaan pengguna dengan informasi yang berguna terkait website mereka.' },
                    { role: 'user', content: ` ini adalah inputan user ke sistem kami "${val}", saya ingin anda menjawab dengan bahasa seperti manusia tapi jelaskan juga bahwa kita tidak bisa melakukan itu kami hanya bisa melakukan audit kualitas website, cek performance seo di search engine dan cek performanace brand di pencarian AI, saya tekankan dengan bahasa manusia dan bercanda jangan kaku` }
                  ]
                })
              });
              const data = await response.json();
              if (response.ok) {
                setMessages(prev => [...prev, {
                  id: getUniqueId(),
                  role: 'assistant',
                  content: data.response,
                  type: 'text'
                },
                   {
                id: getUniqueId(),
                role: 'assistant',
                content:'Silakan pilih layanan yang ingin Anda butuhkan di bawah ini:',
                type: 'options'
              }]);
              } else {
                setMessages(prev => [...prev, {
                  id: getUniqueId(),
                  role: 'assistant',
                  content: 'Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.',
                  type: 'text'
                }]);
              }
            } catch (error) {
              setMessages(prev => [...prev, {
                id: getUniqueId(),
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan jaringan. Silakan coba lagi.',
                type: 'text'
              }]);
            }
            setErrorCount(prev => prev + 1);
            setIsTyping(false);
          })();
        }
      }
    }
  };

  return {
    messages,
    inputValue,
    setInputValue,
    isTyping,
    messagesEndRef,
    handleOptionSelect,
    handleSendInput
  };
};