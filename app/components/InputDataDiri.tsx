'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../utils/supabase';

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().regex(/^\+?\d{8,15}$/, 'Nomor telepon tidak valid (gunakan format internasional jika diperlukan)'),
});

type FormData = z.infer<typeof schema>;

interface InputDataDiriProps {
  onSubmitSuccess: () => void;
}

export default function InputDataDiri({ onSubmitSuccess }: InputDataDiriProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const ip = ipData.ip;

      const { error } = await supabase
        .from('visitor')
        .insert([
          {
            name: data.name,
            email: data.email, // Pastikan kolom di Supabase bernama 'Email'
            no_tlp: data.phone, // Pastikan kolom di Supabase bernama 'no_tlp'
            ip: ip, // Pastikan kolom di Supabase bernama 'Ip'
          },
        ]);

      if (error) throw error;

      localStorage.setItem('userDataSubmitted', Date.now().toString());
      onSubmitSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/10 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-sm sm:max-w-md mx-4 border border-white/20">
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/10 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Selamat Datang</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Silakan lengkapi data diri untuk mulai mengobrol dengan AI</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-2 ml-1">Nama Lengkap</label>
          <input
            {...register('name')}
            type="text"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-sm sm:text-base"
            placeholder="Contoh: Budi Santoso"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1 sm:mt-1.5 ml-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-2 ml-1">Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-sm sm:text-base"
            placeholder="budi@example.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1 sm:mt-1.5 ml-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-2 ml-1">Nomor WhatsApp</label>
          <input
            {...register('phone')}
            type="tel"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-sm sm:text-base"
            placeholder="+628123456789"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1 sm:mt-1.5 ml-1">{errors.phone.message}</p>}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-2 sm:p-3 rounded-lg text-xs border border-red-100 italic">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#082a3d] text-white font-bold py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-xl hover:shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:scale-[0.99] active:scale-[0.97] transition-all disabled:opacity-50 disabled:pointer-events-none mt-3 sm:mt-4 shadow-lg shadow-[#082a3d]/20 text-sm sm:text-base"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Menyimpan...
            </span>
          ) : 'Mulai Menggunakan AI'}
        </button>
      </form>
    </div>
  );
}