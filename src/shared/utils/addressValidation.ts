export function validateColombianAddress(direccion: string): boolean {
  const colombianAddressPattern = /^(Calle|Carrera)\s+\d+\s+#\d+-\d+$/i;
  
  return colombianAddressPattern.test(direccion.trim());
}

export function validateColombianCity(ciudad: string): boolean {
  const validCities = [
    'Bogotá', 'Bogota', 'Bogotá D.C.', 'Bogota D.C.',
    'Medellín', 'Medellin',
    'Cali',
    'Barranquilla',
    'Cartagena',
    'Cúcuta', 'Cucuta',
    'Bucaramanga',
    'Pereira',
    'Santa Marta',
    'Ibagué', 'Ibague',
    'Pasto',
    'Manizales',
    'Neiva',
    'Villavicencio',
    'Armenia',
    'Valledupar',
    'Montería', 'Monteria',
    'Sincelejo',
    'Popayán', 'Popayan',
    'Tunja',
    'Florencia',
    'Riohacha',
    'Quibdó', 'Quibdo',
    'Arauca',
    'Yopal',
    'Mocoa',
    'San José del Guaviare',
    'Leticia',
    'Inírida', 'Inirida',
    'Puerto Carreño',
    'Mitú', 'Mitu'
  ];
  
  return validCities.some(city => 
    city.toLowerCase() === ciudad.toLowerCase()
  );
}

export function validateColombianDepartment(departamento: string): boolean {
  const validDepartments = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
    'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
    'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira',
    'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo',
    'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander',
    'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'
  ];
  
  return validDepartments.some(dept => 
    dept.toLowerCase() === departamento.toLowerCase()
  );
}
