"use client";

import { useState } from "react";
import CarForm from "@/app/carform/page";
import Link from "next/link";

// Reine Funktion für die Filterung der Autos
function filterCars(cars, searchTerm) {
    return cars.filter(car =>
        car.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

// Funktion zum Hinzufügen eines neuen Autos (Unveränderliche Daten)
function addCar(newCar, setCars) {
    setCars(prevCars => [...prevCars, newCar]);
}

// Höhere Funktion (Higher-Order Function), die eine Funktion zum Sortieren von Autos zurückgibt
function sortCars(attribute, order = "asc") {
    return (cars) => {
        return [...cars].sort((a, b) =>
            order === "asc" ? a[attribute] - b[attribute] : b[attribute] - a[attribute]
        );
    };
}

// Funktion zum Laden von Autos (reine Funktion, keine Seiteneffekte)
function loadCars(setCars) {
    fetch("http://localhost:8080/cars")
        .then(response => response.json())
        .then(data => setCars(data))
        .catch(err => console.error("Error fetching cars:", err));
}

// Memoize-Funktion (Vermeidung wiederholter Berechnungen)
const memoize = (fn) => {
    const cache = {};
    return (...args) => {
        const key = JSON.stringify(args);
        if (key in cache) return cache[key];
        const result = fn(...args);
        cache[key] = result;
        return result;
    };
};

export default function Home() {
    const [cars, setCars] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    // Gefilterte und sortierte Autos
    const filteredCars = filterCars(cars, searchTerm);
    const sortedCars = sortCars("horsePower", "asc")(filteredCars);

    return (
        <div className="App">
            <h1>Car Management</h1>


            <button onClick={() => loadCars(setCars)}>Load Cars</button>


            <input
                type="text"
                placeholder="Search by brand"
                onChange={e => setSearchTerm(e.target.value)}
            />




            <ul>
                {sortedCars.length > 0 ? (
                    sortedCars.map(car => (
                        <li key={car.id}>
                            {car.brand} {car.model} ({car.horsePower} HP)
                        </li>
                    ))
                ) : (
                    <p className="no-data">No cars found</p>
                )}
            </ul>
        </div>
    );
}
