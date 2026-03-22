// Генерирует случайное значение нагрузки (от 10 до 90)
export const getLiveLoad = () => Math.floor(Math.random() * 80) + 10;

// Генерирует начальный набор данных (20 точек)
export const getInitialPulse = () => Array.from({ length: 20 }, () => getLiveLoad());
