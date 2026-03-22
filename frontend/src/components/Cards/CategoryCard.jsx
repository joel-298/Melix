import { Link } from 'react-router-dom';

const COLORS = ['#E8115B','#148A08','#E91429','#509BF5','#BC5900','#8D67AB','#1E3264','#E8115B','#1DB954','#AF2896'];

export default function CategoryCard({ category, index = 0 }) {
  const color = COLORS[index % COLORS.length];
  return (
    <Link to={`/category/${category._id}`}>
      <div className="relative rounded-xl overflow-hidden cursor-pointer group aspect-square"
        style={{ backgroundColor: color }}>
        <img src={category.image} alt={category.name}
          className="absolute bottom-0 right-0 w-2/3 h-2/3 object-cover transform rotate-12 translate-x-2 translate-y-2 group-hover:scale-110 transition-transform duration-300 shadow-2xl rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/40" />
        <p className="absolute top-4 left-4 text-white font-bold text-lg leading-tight">{category.name}</p>
      </div>
    </Link>
  );
}
