import Link from 'next/link';
import styles from './styles.module.css'
import { FaCircle } from "react-icons/fa";

const cennik = () => {
    const packages = [
        { name: "Light", duration: "1 miesiąc", details: "Wyświetlanie firmy na stronie", price: "100 zł" },
        { name: "Light", duration: "6 miesięcy", details: "Wyświetlanie firmy na stronie", price: "500 zł" },
        { name: "Light", duration: "12 miesięcy", details: "Wyświetlanie firmy na stronie", price: "900 zł" },
        { name: "Standard", duration: "1 miesiąc", details: "Wyświetlanie + raport PDF z ogólnych wyszukiwań", price: "300 zł" },
        { name: "Standard", duration: "6 miesięcy", details: "Wyświetlanie + comiesięczny raport PDF", price: "1500 zł" },
        { name: "Standard", duration: "12 miesięcy", details: "Wyświetlanie + comiesięczny raport PDF", price: "2500 zł" },
    ];


    return (
        <div className={styles.page}>
            <h1>Cennik</h1>
            <p>Ten cennik jest wyłącznie poglądowy i nie stanowi oferty handlowej</p>
            <div className={styles.container}>
                <div className="overflow-x-auto bg-gray-900 text-white rounded-lg shadow-md">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-800 text-xs uppercase font-medium text-gray-300">
                            <tr>
                                <th className="px-4 py-3">Pakiet</th>
                                <th className="px-4 py-3">Okres</th>
                                <th className="px-4 py-3">Co zawiera</th>
                                <th className="px-4 py-3">Cena (PLN)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {packages.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-800">
                                    <td className="px-4 py-3 font-semibold text-white">{item.name}</td>
                                    <td className="px-4 py-3 text-gray-200">{item.duration}</td>
                                    <td className="px-4 py-3 text-gray-200">{item.details}</td>
                                    <td className="px-4 py-3 text-white">{item.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div>
                    <h3>Dlaczego warto się dodać?</h3>
                    <ul>
                        <li><FaCircle size={10} /> Równe szanse – każda firma ma taką samą widoczność</li>
                        <li><FaCircle size={10} /> Żadnych ukrytych opłat ani reklam</li>
                        <li><FaCircle size={10} /> Raporty statystyk (w pakiecie Standard)</li>
                        <li><FaCircle size={10} /> Promujemy tylko EMS – 100% branżowo</li>
                        <li><FaCircle size={10} /> Możliwość rezygnacji w każdej chwili ze zwrotem środków</li>
                    </ul>
                </div>
            </div>
            <Link href={'formularz_zgloszeniowy_firmy.docx'}><button className={styles.chceZnalezcSie}>Chcę znaleźć się na stronie</button></Link>
        </div>
    );
}

export default cennik;
