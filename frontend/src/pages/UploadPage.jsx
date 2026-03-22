import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { BsCheckCircleFill, BsCloudUpload, BsMusicNote } from 'react-icons/bs';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STEPS = ['Artist', 'Category', 'Song'];

export default function UploadPage() {
  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  // Artists state
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState('');
  const [newArtist, setNewArtist] = useState(false);
  const [artistName, setArtistName] = useState('');
  const [artistAbout, setArtistAbout] = useState('');
  const [artistImage, setArtistImage] = useState(null);
  const [artistPreview, setArtistPreview] = useState('');

  // Categories state
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryPreview, setCategoryPreview] = useState('');

  // Song state
  const [songName, setSongName] = useState('');
  const [songFile, setSongFile] = useState(null);
  const [songImage, setSongImage] = useState(null);
  const [songImagePreview, setSongImagePreview] = useState('');
  const [songFilePreview, setSongFilePreview] = useState('');

  const formRef = useRef(null);

  useEffect(() => {
    api.get('/artists').then(r => setArtists(r.data.artists || []));
    api.get('/categories').then(r => setCategories(r.data.categories || []));
  }, []);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
    }
  }, [step]);

  const canNext = () => {
    if (step === 0) {
      if (newArtist) return artistName.trim() && artistImage;
      return !!selectedArtist;
    }
    if (step === 1) {
      if (newCategory) return categoryName.trim() && categoryImage;
      return !!selectedCategory;
    }
    if (step === 2) return songName.trim() && songFile && songImage;
    return false;
  };

  const handleNext = () => {
    if (!canNext()) return toast.error('Please fill all required fields');
    if (step < 2) setStep(s => s + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setUploading(true);
    setProgress(0);
    try {
      let artistId = selectedArtist;
      let categoryId = selectedCategory;

      // Create artist if new
      if (newArtist) {
        setProgress(15);
        const fd = new FormData();
        fd.append('name', artistName.trim());
        fd.append('about', artistAbout.trim());
        fd.append('image', artistImage);
        const r = await api.post('/artists', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        artistId = r.data.artist._id;
        setArtists(prev => [...prev, r.data.artist]);
      }
      setProgress(30);

      // Create category if new
      if (newCategory) {
        setProgress(45);
        const fd = new FormData();
        fd.append('name', categoryName.trim());
        fd.append('image', categoryImage);
        const r = await api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        categoryId = r.data.category._id;
        setCategories(prev => [...prev, r.data.category]);
      }
      setProgress(60);

      // Upload song
      const fd = new FormData();
      fd.append('name', songName.trim());
      fd.append('artistId', artistId);
      fd.append('categoryId', categoryId);
      fd.append('songFile', songFile);
      fd.append('songImage', songImage);

      await api.post('/songs', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded / e.total) * 35);
          setProgress(60 + pct);
        },
      });
      setProgress(100);
      setDone(true);
      toast.success('Song uploaded successfully! 🎵');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
      setUploading(false);
    }
  };

  const reset = () => {
    setStep(0); setDone(false); setUploading(false); setProgress(0);
    setSelectedArtist(''); setNewArtist(false); setArtistName(''); setArtistAbout(''); setArtistImage(null); setArtistPreview('');
    setSelectedCategory(''); setNewCategory(false); setCategoryName(''); setCategoryImage(null); setCategoryPreview('');
    setSongName(''); setSongFile(null); setSongImage(null); setSongImagePreview(''); setSongFilePreview('');
  };

  if (done) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center fade-in">
      <gsap.div>
        <BsCheckCircleFill className="text-8xl text-[#1DB954] mb-6 mx-auto animate-bounce" />
      </gsap.div>
      <h2 className="text-3xl font-bold text-white mb-3">Upload Complete!</h2>
      <p className="text-[#B3B3B3] mb-8">Your song is now live on Melix 🎵</p>
      <button onClick={reset} className="bg-[#1DB954] text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">
        Upload Another Song
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-6 fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">Upload Music</h1>

      {/* Stepper */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`flex flex-col items-center ${i <= step ? 'text-[#1DB954]' : 'text-[#535353]'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                i < step ? 'bg-[#1DB954] border-[#1DB954] text-black' :
                i === step ? 'border-[#1DB954] text-[#1DB954]' :
                'border-[#535353] text-[#535353]'
              }`}>
                {i < step ? <BsCheckCircleFill className="text-lg" /> : i + 1}
              </div>
              <span className="text-xs mt-1 font-semibold">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 mt-[-16px] transition-colors duration-300 ${i < step ? 'bg-[#1DB954]' : 'bg-[#535353]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-6 bg-[#181818] rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold text-sm">Uploading to Cloudinary...</span>
            <span className="text-[#1DB954] font-bold">{progress}%</span>
          </div>
          <div className="h-2 bg-[#282828] rounded-full overflow-hidden">
            <div className="h-full bg-[#1DB954] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-[#B3B3B3] mt-2">
            {progress < 30 ? 'Setting up artist...' : progress < 60 ? 'Setting up category...' : progress < 95 ? 'Uploading song file...' : 'Almost done...'}
          </p>
        </div>
      )}

      {/* Form Steps */}
      <div ref={formRef} className="bg-[#181818] rounded-2xl p-6">
        {/* STEP 0: Artist */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-white">Step 1: Select Artist</h2>
            <div className="flex gap-3">
              <button onClick={() => setNewArtist(false)}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold border transition-all ${!newArtist ? 'border-[#1DB954] text-[#1DB954] bg-[#1DB954]/10' : 'border-[#3E3E3E] text-[#B3B3B3] hover:border-white'}`}>
                Existing Artist
              </button>
              <button onClick={() => setNewArtist(true)}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold border transition-all ${newArtist ? 'border-[#1DB954] text-[#1DB954] bg-[#1DB954]/10' : 'border-[#3E3E3E] text-[#B3B3B3] hover:border-white'}`}>
                + New Artist
              </button>
            </div>
            {!newArtist ? (
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {artists.map(a => (
                  <button key={a._id} onClick={() => setSelectedArtist(a._id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedArtist === a._id ? 'border-[#1DB954] bg-[#1DB954]/10' : 'border-[#3E3E3E] hover:border-[#535353]'}`}>
                    <img src={a.image} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    <span className="text-white text-sm font-medium truncate">{a.name}</span>
                  </button>
                ))}
                {artists.length === 0 && <p className="text-[#B3B3B3] text-sm col-span-2">No artists yet. Create one!</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#B3B3B3] font-semibold mb-2 block">Artist Name *</label>
                  <input value={artistName} onChange={e => setArtistName(e.target.value)} placeholder="e.g. Arijit Singh"
                    className="w-full bg-[#282828] text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#1DB954] text-sm" />
                </div>
                <div>
                  <label className="text-sm text-[#B3B3B3] font-semibold mb-2 block">About</label>
                  <textarea value={artistAbout} onChange={e => setArtistAbout(e.target.value)} rows={3} placeholder="Short description about the artist..."
                    className="w-full bg-[#282828] text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#1DB954] text-sm resize-none" />
                </div>
                <div>
                  <label className="text-sm text-[#B3B3B3] font-semibold mb-2 block">Artist Image *</label>
                  <label className="border-2 border-dashed border-[#3E3E3E] hover:border-[#1DB954] rounded-xl p-6 flex flex-col items-center cursor-pointer transition-colors">
                    {artistPreview
                      ? <img src={artistPreview} alt="" className="w-24 h-24 rounded-full object-cover mb-2" />
                      : <BsCloudUpload className="text-4xl text-[#B3B3B3] mb-2" />
                    }
                    <span className="text-[#B3B3B3] text-sm">{artistImage ? artistImage.name : 'Click to upload image'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => { setArtistImage(e.target.files[0]); setArtistPreview(URL.createObjectURL(e.target.files[0])); }} />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Category */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-white">Step 2: Select Category</h2>
            <div className="flex gap-3">
              <button onClick={() => setNewCategory(false)}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold border transition-all ${!newCategory ? 'border-[#1DB954] text-[#1DB954] bg-[#1DB954]/10' : 'border-[#3E3E3E] text-[#B3B3B3] hover:border-white'}`}>
                Existing Category
              </button>
              <button onClick={() => setNewCategory(true)}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold border transition-all ${newCategory ? 'border-[#1DB954] text-[#1DB954] bg-[#1DB954]/10' : 'border-[#3E3E3E] text-[#B3B3B3] hover:border-white'}`}>
                + New Category
              </button>
            </div>
            {!newCategory ? (
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {categories.map(c => (
                  <button key={c._id} onClick={() => setSelectedCategory(c._id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedCategory === c._id ? 'border-[#1DB954] bg-[#1DB954]/10' : 'border-[#3E3E3E] hover:border-[#535353]'}`}>
                    <img src={c.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <span className="text-white text-sm font-medium truncate">{c.name}</span>
                  </button>
                ))}
                {categories.length === 0 && <p className="text-[#B3B3B3] text-sm col-span-2">No categories yet. Create one!</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#B3B3B3] font-semibold mb-2 block">Category Name *</label>
                  <input value={categoryName} onChange={e => setCategoryName(e.target.value)} placeholder="e.g. Bollywood, Pop, Jazz"
                    className="w-full bg-[#282828] text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#1DB954] text-sm" />
                </div>
                <div>
                  <label className="text-sm text-[#B3B3B3] font-semibold mb-2 block">Category Image *</label>
                  <label className="border-2 border-dashed border-[#3E3E3E] hover:border-[#1DB954] rounded-xl p-6 flex flex-col items-center cursor-pointer transition-colors">
                    {categoryPreview
                      ? <img src={categoryPreview} alt="" className="w-24 h-24 rounded-xl object-cover mb-2" />
                      : <BsCloudUpload className="text-4xl text-[#B3B3B3] mb-2" />
                    }
                    <span className="text-[#B3B3B3] text-sm">{categoryImage ? categoryImage.name : 'Click to upload image'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => { setCategoryImage(e.target.files[0]); setCategoryPreview(URL.createObjectURL(e.target.files[0])); }} />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Song */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-white">Step 3: Song Details</h2>
            <div>
              <label className="text-sm text-[#B3B3B3] font-semibold mb-2 block">Song Name *</label>
              <input value={songName} onChange={e => setSongName(e.target.value)} placeholder="e.g. Tum Hi Ho"
                className="w-full bg-[#282828] text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#1DB954] text-sm" />
            </div>
            <div>
              <label className="text-sm text-[#B3B3B3] font-semibold mb-2 block">Song Cover Image *</label>
              <label className="border-2 border-dashed border-[#3E3E3E] hover:border-[#1DB954] rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-colors">
                {songImagePreview
                  ? <img src={songImagePreview} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  : <BsCloudUpload className="text-3xl text-[#B3B3B3] flex-shrink-0" />
                }
                <div>
                  <p className="text-white text-sm font-medium">{songImage ? songImage.name : 'Upload cover image'}</p>
                  <p className="text-[#B3B3B3] text-xs mt-0.5">JPG, PNG, WebP (max 5MB)</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => { setSongImage(e.target.files[0]); setSongImagePreview(URL.createObjectURL(e.target.files[0])); }} />
              </label>
            </div>
            <div>
              <label className="text-sm text-[#B3B3B3] font-semibold mb-2 block">Audio File * (MP3/MP4, 3-15MB)</label>
              <label className="border-2 border-dashed border-[#3E3E3E] hover:border-[#1DB954] rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-colors">
                <BsMusicNote className="text-3xl text-[#B3B3B3] flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{songFile ? songFile.name : 'Upload audio file'}</p>
                  <p className="text-[#B3B3B3] text-xs mt-0.5">MP3, MP4, WAV (max 15MB)</p>
                </div>
                <input type="file" accept="audio/*,video/mp4" className="hidden" onChange={e => { setSongFile(e.target.files[0]); setSongFilePreview(URL.createObjectURL(e.target.files[0])); }} />
              </label>
              {songFilePreview && <audio src={songFilePreview} controls className="mt-3 w-full h-8" />}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-5 border-t border-[#282828]">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-[#B3B3B3] hover:text-white disabled:opacity-30 transition-colors border border-[#3E3E3E] hover:border-white disabled:hover:border-[#3E3E3E]">
            <MdArrowBack /> Back
          </button>
          <button onClick={handleNext} disabled={!canNext() || uploading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold bg-[#1DB954] text-black hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-transform">
            {step === 2 ? (uploading ? 'Uploading...' : '🚀 Upload') : <><span>Next</span><MdArrowForward /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
