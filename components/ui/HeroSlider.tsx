'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getActiveSlides, type HeroSlide } from '@/lib/content';
import { mediaUrl } from '@/lib/api';

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeSlides, setActiveSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    getActiveSlides(controller.signal)
      .then((slides) => {
        setActiveSlides(slides);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Failed to load hero slides', err);
          setIsLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (activeSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  if (isLoading || activeSlides.length === 0) return null;

  return (
    <section className="relative bg-navy overflow-hidden">
      {/* Slides Container */}
      <div className="relative h-[80vh] min-h-[600px] w-full">
        {activeSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image */}
            <Image
              src={mediaUrl(slide.image_url)}
              alt={slide.title}
              fill
              className="object-cover opacity-40"
              fetchPriority={index === 0 ? "high" : "auto"}
              unoptimized
              sizes="100vw"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent opacity-60" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="section-container w-full">
                <div className="max-w-2xl transform transition-all duration-1000 translate-y-0 opacity-100">
                  {slide.subtitle && (
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white/90 mb-6 border border-white/20">
                      <Star size={14} className="text-gold" />
                      <span className="tracking-wide font-medium">{slide.subtitle}</span>
                    </div>
                  )}
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
                    {slide.title}
                  </h1>
                  
                  <p className="text-white/80 text-lg lg:text-xl leading-relaxed mb-8 max-w-xl font-medium">
                    {slide.description || 'A nurturing environment where every child discovers their potential through quality education and a love for learning.'}
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    {slide.cta_link ? (
                      <Button href={slide.cta_link} size="lg" className="bg-gold text-navy hover:bg-gold-light border-none shadow-xl shadow-gold/20">
                        {slide.cta_label || 'Explore'}
                        <ArrowRight size={18} />
                      </Button>
                    ) : (
                      <Button href="/about" size="lg" className="bg-gold text-navy hover:bg-gold-light border-none shadow-xl shadow-gold/20">
                        Explore Our School
                        <ArrowRight size={18} />
                      </Button>
                    )}
                    <Button href="/enquiry" size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm">
                      Enquire Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        {activeSlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/10"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/10"
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Indicators */}
        {activeSlides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {activeSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-gold w-8' : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold via-school-blue to-navy-dark z-20" />
    </section>
  );
}
