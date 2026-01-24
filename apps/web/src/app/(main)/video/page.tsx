import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tutoriale Video | Culinaria Acasă',
  description:
    'Învață tehnici culinare și rețete tradiționale prin tutoriale video de calitate.',
};

const videos = [
  {
    id: 1,
    youtubeId: 'dQw4w9WgXcQ', // Replace with actual cooking video ID
    title: 'Cum să Prepari Mămăliga Perfectă',
    description: 'Secretele unei mămăligi pufoase și aurii, exact ca la bunica.',
  },
  {
    id: 2,
    youtubeId: 'dQw4w9WgXcQ', // Replace with actual cooking video ID
    title: 'Tehnici de Pliere a Plăcintelor',
    description: 'Învață diferite moduri de a plia plăcintele tradiționale.',
  },
  {
    id: 3,
    youtubeId: 'dQw4w9WgXcQ', // Replace with actual cooking video ID
    title: 'Prepararea Zacuscăi de Casă',
    description: 'Rețeta completă pentru zacusca tradițională moldovenească.',
  },
  {
    id: 4,
    youtubeId: 'dQw4w9WgXcQ', // Replace with actual cooking video ID
    title: 'Sarmale ca la Mama Acasă',
    description: 'Pas cu pas pentru cele mai bune sarmale de sărbători.',
  },
];

export default function VideoLibraryPage() {
  return (
    <main className="min-h-screen bg-theme-primary pt-20">
      {/* Hero Section */}
      <section className="py-12 bg-theme-secondary">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-pink text-brown text-sm font-medium mb-4">
            <i className="fas fa-video mr-2"></i>Biblioteca Video
          </span>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-theme-primary mb-4">
            Tutoriale de Gătit
          </h1>
          <p className="text-theme-secondary max-w-2xl mx-auto">
            Învață secretele bucătăriei tradiționale moldovenești prin
            tutorialele noastre video detaliate și ușor de urmărit.
          </p>
        </div>
      </section>

      {/* Video Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-theme-card rounded-2xl overflow-hidden shadow-rustic"
              >
                {/* YouTube Embed */}
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                {/* Video Info */}
                <div className="p-5">
                  <h3 className="font-heading text-lg font-bold text-theme-primary mb-2">
                    {video.title}
                  </h3>
                  <p className="text-theme-secondary text-sm">
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="bg-theme-card rounded-2xl p-8 shadow-rustic max-w-2xl mx-auto">
              <i className="fas fa-bell text-4xl text-peach mb-4"></i>
              <h2 className="font-heading text-2xl font-bold text-theme-primary mb-4">
                Abonează-te la Canalul Nostru
              </h2>
              <p className="text-theme-secondary mb-6">
                Primește notificări când publicăm tutoriale noi.
              </p>
              <a
                href="https://youtube.com/@CulinariaAcasa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors"
              >
                <i className="fab fa-youtube"></i>
                Abonează-te pe YouTube
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
