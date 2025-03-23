import ImageEditor from "./ImageEditor";
import { Card } from "./ui/card";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-500 p-4 md:p-8 flex flex-col">
      <header className="w-full max-w-7xl mx-auto mb-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Image Editor
          </h1>
          <p className="text-gray-600 mt-2">Upload an image and adjust it</p>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto">
        <Card className="bg-white shadow-xl rounded-xl overflow-hidden border-0">
          <div className="h-auto">
            <ImageEditor
              onImageProcessed={(original, processed) => {
                // This would handle any post-processing logic
                console.log("Image processed");
              }}
            />
          </div>
        </Card>
      </main>

      <footer className="w-full max-w-7xl mx-auto mt-8 text-center text-white text-sm">
        <p className="mt-1">Supports JPG, PNG, and WebP formats</p>
        <p>© 2025 Febrian Syahroni</p>
      </footer>
    </div>
  );
};

export default Home;
