
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    quote: "PyVenture made learning Python fun! The gamified approach kept me engaged and the AI feedback helped me improve quickly.",
    author: "Alex Chen",
    role: "Computer Science Student",
    avatar: "AC",
    rating: 5
  },
  {
    quote: "The interactive challenges are addictive. I found myself coding for hours without realizing it. Best learning platform I've used.",
    author: "Sophia Rodriguez",
    role: "Web Developer",
    avatar: "SR",
    rating: 5
  },
  {
    quote: "As someone with no prior coding experience, PyVenture's approach made Python accessible and enjoyable. The space theme is awesome!",
    author: "James Wilson",
    role: "Marketing Professional",
    avatar: "JW",
    rating: 4
  },
  {
    quote: "The adaptive difficulty is perfect - challenges get harder as I improve, keeping me motivated. Now I code Python confidently.",
    author: "Mei Zhang",
    role: "Data Analyst",
    avatar: "MZ",
    rating: 5
  },
  {
    quote: "The leaderboards feature adds a competitive edge that keeps me coming back. It's like a coding game that actually teaches you!",
    author: "Raj Patel",
    role: "CS Graduate",
    avatar: "RP",
    rating: 5
  }
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextTestimonial = () => {
    setActiveIndex((current) => (current === testimonials.length - 1 ? 0 : current + 1));
  };
  
  const prevTestimonial = () => {
    setActiveIndex((current) => (current === 0 ? testimonials.length - 1 : current - 1));
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-space-nebula opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-space-neon-cyan opacity-5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Cosmic <span className="glow-text">Testimonials</span>
          </h2>
          <p className="text-xl text-gray-300">
            Hear from our cosmic community of Python explorers
          </p>
        </div>

        <div className="relative">
          {/* Large screens: Show multiple testimonials */}
          <div className="hidden lg:grid grid-cols-3 gap-6">
            {[0, 1, 2].map((offset) => {
              const index = (activeIndex + offset) % testimonials.length;
              return (
                <TestimonialCard key={index} testimonial={testimonials[index]} />
              );
            })}
          </div>
          
          {/* Small screens: Show single testimonial */}
          <div className="lg:hidden">
            <TestimonialCard testimonial={testimonials[activeIndex]} />
          </div>
          
          {/* Navigation controls */}
          <div className="flex justify-center mt-8 space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prevTestimonial}
              className="rounded-full border-space-nebula/50 hover:bg-space-nebula/10"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous</span>
            </Button>
            
            <div className="flex space-x-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-colors",
                    idx === activeIndex 
                      ? "bg-space-nebula" 
                      : "bg-space-nebula/30 hover:bg-space-nebula/50"
                  )}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextTestimonial}
              className="rounded-full border-space-nebula/50 hover:bg-space-nebula/10"
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => {
  return (
    <Card className="cosmic-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <Avatar className="h-12 w-12 border-2 border-space-nebula">
          <AvatarFallback className="bg-space-deep-purple text-white">
            {testimonial.avatar}
          </AvatarFallback>
          <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${testimonial.author}`} />
        </Avatar>
        
        <div className="flex">
          {Array(5).fill(null).map((_, i) => (
            <Star 
              key={i} 
              className={cn(
                "h-4 w-4", 
                i < testimonial.rating 
                  ? "text-space-meteor-orange fill-space-meteor-orange" 
                  : "text-gray-500"
              )} 
            />
          ))}
        </div>
      </div>
      
      <blockquote className="text-gray-200 flex-grow">
        "{testimonial.quote}"
      </blockquote>
      
      <div className="mt-6">
        <p className="font-medium text-white">{testimonial.author}</p>
        <p className="text-sm text-gray-400">{testimonial.role}</p>
      </div>
    </Card>
  );
};

export default TestimonialsSection;
