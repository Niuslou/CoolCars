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

// Funktion für die Sortierung basierend auf Benutzerwahl
function dynamicSortCars(cars, sortAttribute, sortOrder) {
    return [...cars].sort((a, b) => {
        if (sortOrder === "asc") {
            return a[sortAttribute] > b[sortAttribute] ? 1 : -1;
        } else {
            return a[sortAttribute] < b[sortAttribute] ? 1 : -1;
        }
    });
}

export default function Home() {
    const [cars, setCars] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    // Sortierattribute und -reihenfolge aus dem Zustand verwalten
    const [sortAttribute, setSortAttribute] = useState("horsePower");
    const [sortOrder, setSortOrder] = useState("asc");

    // Paging-Zustand
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Gefilterte Autos
    const filteredCars = filterCars(cars, searchTerm);

    // Dynamisch sortierte Autos basierend auf Auswahl
    const sortedCars = dynamicSortCars(filteredCars, sortAttribute, sortOrder);

    // Paginierte Autos
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCars = sortedCars.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(sortedCars.length / itemsPerPage);

    return (
        <div className="App">
            <h1>Car Management</h1>

            <button onClick={() => loadCars(setCars)}>Autos laden</button>

            <input
                type="text"
                placeholder="Nach Marke suchen"
                onChange={e => setSearchTerm(e.target.value)}
            />

            <div className="sort-options">
                <h3>Sortieren nach:</h3>
                <label>
                    <input
                        type="radio"
                        name="sortAttribute"
                        value="brand"
                        checked={sortAttribute === "brand"}
                        onChange={(e) => setSortAttribute(e.target.value)}
                    />
                    Marke
                </label>
                <label>
                    <input
                        type="radio"
                        name="sortAttribute"
                        value="model"
                        checked={sortAttribute === "model"}
                        onChange={(e) => setSortAttribute(e.target.value)}
                    />
                    Model
                </label>
                <label>
                    <input
                        type="radio"
                        name="sortAttribute"
                        value="horsePower"
                        checked={sortAttribute === "horsePower"}
                        onChange={(e) => setSortAttribute(e.target.value)}
                    />
                    PS
                </label>

                <h3>Reihenfolge:</h3>
                <label>
                    <input
                        type="radio"
                        name="sortOrder"
                        value="asc"
                        checked={sortOrder === "asc"}
                        onChange={(e) => setSortOrder(e.target.value)}
                    />
                    Aufsteigend
                </label>
                <label>
                    <input
                        type="radio"
                        name="sortOrder"
                        value="desc"
                        checked={sortOrder === "desc"}
                        onChange={(e) => setSortOrder(e.target.value)}
                    />
                    Absteigend
                </label>
            </div>

            <ul>
                {currentCars.length > 0 ? (
                    currentCars.map(car => (
                        <li key={car.id}>
                            {car.brand} {car.model} ({car.horsePower} HP)
                        </li>
                    ))
                ) : (
                    <p className="no-data">No cars found</p>
                )}
            </ul>

            <div className="pagination">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
