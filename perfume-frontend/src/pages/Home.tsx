import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./Home.css";

interface Brand {
  _id: string;
  brandName: string;
}

interface Perfume {
  _id: string;
  perfumeName: string;
  uri: string;
  price: number;
  concentration: string;
  targetAudience: string;
  brand: Brand;
}

export default function Home() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPerfumes = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (brandFilter) params.brand = brandFilter;
      const res = await api.get("/perfumes", { params });
      setPerfumes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await api.get("/brands");
      setBrands(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchPerfumes();
  }, [brandFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPerfumes();
  };

  const getConcentrationClass = (c: string) => {
    const lower = c.toLowerCase();
    if (lower === "extrait") return "concentration-extrait";
    if (lower === "edp") return "concentration-edp";
    if (lower === "edt") return "concentration-edt";
    return "concentration-other";
  };

  const getAudienceIcon = (a: string) => {
    if (a === "male") return "♂";
    if (a === "female") return "♀";
    return "⚥";
  };

  return (
    <div className="home">
      <div className="home-hero">
        <h1>Discover Your Signature Scent</h1>
        <p>Explore our curated collection of premium perfumes</p>
      </div>

      <div className="home-filters">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search perfumes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b._id} value={b._id}>{b.brandName}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading perfumes...</div>
      ) : perfumes.length === 0 ? (
        <div className="empty">No perfumes found.</div>
      ) : (
        <div className="perfume-grid">
          {perfumes.map((p) => (
            <Link to={`/perfumes/${p._id}`} key={p._id} className="perfume-card">
              <div className="card-image">
                <img src={p.uri} alt={p.perfumeName} />
                <span className={`concentration-badge ${getConcentrationClass(p.concentration)}`}>
                  {p.concentration}
                </span>
              </div>
              <div className="card-body">
                <h3>{p.perfumeName}</h3>
                <p className="card-brand">{p.brand?.brandName}</p>
                <div className="card-footer">
                  <span className="card-price">${p.price}</span>
                  <span className="card-audience">{getAudienceIcon(p.targetAudience)} {p.targetAudience}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
