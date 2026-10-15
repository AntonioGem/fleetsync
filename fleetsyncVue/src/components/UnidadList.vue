<template>
  <aside class="unidad-list">
    <div class="unidad-filters">
      
      <div class="dropdown">
        <button class="filter-button" @click="toggleDropdown('unidad')">
          Unidad: {{ getFilterSummary(filterUnidad, 'Todas') }}
        </button>
        <ul v-if="showUnidadDropdown" class="dropdown-list">
          <li @click="selectFilter('filterUnidad', '')" :class="{ selected: filterUnidad.length === 0 }">
            Todas
          </li>
          <li
            v-for="unidad in uniqueUnidades"
            :key="unidad"
            @click="selectFilter('filterUnidad', unidad)"
            :class="{ selected: filterUnidad.includes(unidad) }"
          >
            {{ unidad }}
          </li>
        </ul>
      </div>

      <div class="dropdown">
        <button class="filter-button" @click="toggleDropdown('status')">
          Estatus: {{ getFilterSummary(filterStatus, 'Todos') }}
        </button>
        <ul v-if="showStatusDropdown" class="dropdown-list">
          <li @click="selectFilter('filterStatus', '')" :class="{ selected: filterStatus.length === 0 }">
            Todos
          </li>
          <li @click="selectFilter('filterStatus', 'Disponible')" :class="{ selected: filterStatus.includes('Disponible') }">
            Disponible
          </li>
          <li @click="selectFilter('filterStatus', 'Ocupada')" :class="{ selected: filterStatus.includes('Ocupada') }">
            Ocupada
          </li>
        </ul>
      </div>

      <div class="dropdown">
        <button class="filter-button" @click="toggleDropdown('tipo')">
          Tipo: {{ getFilterSummary(filterTipo, 'Todos') }}
        </button>
        <ul v-if="showTipoDropdown" class="dropdown-list">
          <li @click="selectFilter('filterTipo', '')" :class="{ selected: filterTipo.length === 0 }">
            Todos
          </li>
          <li
            v-for="tipo in uniqueTipos"
            :key="tipo"
            @click="selectFilter('filterTipo', tipo)"
            :class="{ selected: filterTipo.includes(tipo) }"
          >
            {{ tipo }}
          </li>
        </ul>
      </div>

      <div class="dropdown">
        <button class="filter-button" @click="toggleDropdown('base')">
          Base: {{ getFilterSummary(filterBase, 'Todas') }}
        </button>
        <ul v-if="showBaseDropdown" class="dropdown-list">
          <li @click="selectFilter('filterBase', '')" :class="{ selected: filterBase.length === 0 }">
            Todas
          </li>
          <li
            v-for="base in uniqueBases"
            :key="base"
            @click="selectFilter('filterBase', base)"
            :class="{ selected: filterBase.includes(base) }"
          >
            {{ base }}
          </li>
        </ul>
      </div>
    </div>

    <div class="unidad-overview">
      <div class="overview-item">
        <span class="label">Unidades totales</span>
        <span class="count">{{ totalUnits }}</span>
      </div>
      <div class="overview-item">
        <span class="label">Disponibles</span>
        <span class="count">{{ availableUnits }}</span>
      </div>
      <div class="overview-item">
        <span class="label">Ocupadas</span>
        <span class="count">{{ occupiedUnits }}</span>
      </div>
    </div>

    <div class="unidad-list-scrollable">
      <ul>
        <li
          v-for="(unidad, index) in filteredData"
          :key="unidad.UNIDAD"
          @click="selectUnidad(index)"
          :class="{ 'active': unidad === selectedUnidad }"
        >
          <div class="unidad-info-container">
            <span class="unidad-title">{{ unidad.UNIDAD }} - {{ unidad.TIPO }}</span>
            <!-- Mostrar tiempo de liberación solo si está ocupada y tiene fecha de vencimiento -->
            <span 
              v-if="unidad.ESTATUS === 'Ocupada' && unidad.FECHA_VENCIMIENTO" 
              class="unidad-release-time"
            >
              {{ calcularTiempoLiberacion(unidad.FECHA_VENCIMIENTO) }}
            </span>
          </div>

          <span
            class="status-icon"
            :class="{ green: unidad.ESTATUS === 'Disponible', red: unidad.ESTATUS === 'Ocupada' }"
          ></span>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script>
export default {
  props: {
    data: Array,
    selectedIndex: Number,
    selectedUnidad: Object,
  },
  emits: ['select-unidad'],
  data() {
    return {
      filterUnidad: [],
      filterStatus: [],
      filterTipo: [],
      filterBase: [],
      showUnidadDropdown: false,
      showStatusDropdown: false,
      showTipoDropdown: false,
      showBaseDropdown: false,
      // Usaremos un intervalo para actualizar los tiempos en vivo si la app se queda abierta
      intervalId: null, 
      currentTime: new Date(),
    };
  },
  mounted() {
    // Actualizar la hora actual cada minuto para que el cálculo se mantenga fresco
    this.intervalId = setInterval(() => {
      this.currentTime = new Date();
    }, 60000);
  },
  beforeUnmount() {
    if (this.intervalId) clearInterval(this.intervalId);
  },
  computed: {
    filteredData() {
      const filters = {
        UNIDAD: this.filterUnidad,
        ESTATUS: this.filterStatus,
        TIPO: this.filterTipo,
        BASE: this.filterBase,
      };

      return this.data.filter(unidad => {
        const matchesUnidad = filters.UNIDAD.length === 0 || filters.UNIDAD.includes(unidad.UNIDAD);
        const matchesStatus = filters.ESTATUS.length === 0 || filters.ESTATUS.includes(unidad.ESTATUS);
        const matchesTipo = filters.TIPO.length === 0 || filters.TIPO.includes(unidad.TIPO);
        const matchesBase = filters.BASE.length === 0 || filters.BASE.includes(unidad.BASE);
        
        return matchesUnidad && matchesStatus && matchesTipo && matchesBase;
      });
    },

    getFilterSummary() {
        return (filterArray, allText) => {
            if (filterArray.length === 0) return allText;
            if (filterArray.length === 1) return filterArray[0];
            return `${filterArray.length} Seleccionados`;
        };
    },
    
    uniqueUnidades() {
      return [...new Set(this.data.map(u => u.UNIDAD))].filter(Boolean).sort();
    },
    uniqueTipos() {
      return [...new Set(this.data.map(u => u.TIPO))].filter(Boolean).sort();
    },
    uniqueBases() {
      return [...new Set(this.data.map(u => u.BASE))].filter(Boolean).sort();
    },
    
    totalUnits() {
      return this.filteredData.length;
    },
    availableUnits() {
      return this.filteredData.filter(unidad => unidad.ESTATUS === 'Disponible').length;
    },
    occupiedUnits() {
      return this.filteredData.filter(unidad => unidad.ESTATUS === 'Ocupada').length;
    },
  },
  methods: {
    selectFilter(filterName, value) {
      if (value === '') {
        this[filterName] = [];
        return;
      }
      const currentFilters = this[filterName];
      const index = currentFilters.indexOf(value);

      if (index > -1) {
        currentFilters.splice(index, 1);
      } else {
        currentFilters.push(value);
      }
      this[filterName] = [...currentFilters];
    },

    toggleDropdown(type) {
      this.showUnidadDropdown = type === 'unidad' ? !this.showUnidadDropdown : false;
      this.showStatusDropdown = type === 'status' ? !this.showStatusDropdown : false;
      this.showTipoDropdown = type === 'tipo' ? !this.showTipoDropdown : false;
      this.showBaseDropdown = type === 'base' ? !this.showBaseDropdown : false;
    },

    selectUnidad(filteredIndex) {
      const unidad = this.filteredData[filteredIndex];
      const originalIndex = this.data.findIndex(u => u === unidad);
      this.$emit('select-unidad', originalIndex);
    },

    // NUEVO MÉTODO: Calcular diferencia de fechas
    calcularTiempoLiberacion(fechaString) {
      if (!fechaString || fechaString === 'Sin fecha') return 'Fecha no válida';

      // 1. Convertir formato de Firebird "DD.MM.YYYY HH:mm" a "YYYY-MM-DDTHH:mm:00"
      const partes = fechaString.split(' ');
      if (partes.length !== 2) return 'Formato incorrecto';

      const partesFecha = partes[0].split('.'); // [DD, MM, YYYY]
      const hora = partes[1]; // HH:mm

      if (partesFecha.length !== 3) return 'Formato de fecha incorrecto';

      const fechaISO = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}T${hora}:00`;
      const vencimiento = new Date(fechaISO);
      
      if (isNaN(vencimiento.getTime())) {
        return 'Fecha no válida';
      }

      // Formatear la fecha objetivo a DD/MM/YYYY hh:mm a.m./p.m.
      const year = vencimiento.getFullYear();
      const month = String(vencimiento.getMonth() + 1).padStart(2, '0');
      const day = String(vencimiento.getDate()).padStart(2, '0');
      
      // Lógica para formato 12 horas (a.m. / p.m.)
      let hours = vencimiento.getHours();
      const minutes = String(vencimiento.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
      
      hours = hours % 12;
      hours = hours ? hours : 12; // La hora '0' (medianoche) se convierte en '12'
      const formattedHours = String(hours).padStart(2, '0'); // Opcional: agrega el cero inicial a las horas (ej. 01:30)

      const fechaFormateada = `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;

      const diffMs = vencimiento - this.currentTime; 

      // Si el tiempo ya se cumplió (la diferencia es negativa o cero)
      if (diffMs <= 0) {
        const tiempoPasadoMs = Math.abs(diffMs); // Convertimos a positivo
        const horasPasadas = Math.floor(tiempoPasadoMs / (1000 * 60 * 60));
        const minutosPasados = Math.floor((tiempoPasadoMs % (1000 * 60 * 60)) / (1000 * 60));
        return `Debio quedar libre hace ${horasPasadas} horas y ${minutosPasados} minutos (${fechaFormateada})`;
      }

      // Si el tiempo aún no se cumple
      const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return `Libre en ${diffHoras} horas y ${diffMinutos} minutos (${fechaFormateada})`;
    }
  },
};
</script>

<style>
.unidad-list {
  width: 600px; /* or appropriate height */
  display: flex;
  flex-direction: column;
}

.unidad-list-scrollable {
  overflow-y: auto;
  flex-grow: 1;
}

.unidad-overview {
  display: flex;
  justify-content: space-around;
  text-align: center;
  background-color: #fff;
  padding: 20px;
  margin-bottom: 10px;
  border-radius: 10px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
}

.overview-item {
  flex: 1;
}

.overview-item .label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #555;
  margin-bottom: 5px;
}

.overview-item .count {
  font-size: 38px; /* Big number */
  font-weight: bold;
  color: #222;
}

.unidad-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.unidad-list li {
  padding: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unidad-list li.active {
  background-color: #007bff;
  color: #fff;
}

.status-icon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.unidad-list-scrollable li {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.status-icon.green {
  background-color: green;
}

.status-icon.red {
  background-color: red;
}

.unidad-filters {
  display: flex;
  justify-content: space-between;
  /* Espacio aumentado para separar de Overview */
  margin-bottom: 20px; 
  gap: 10px;
  flex-wrap: wrap;
}

.unidad-filters label {
  display: flex;
  flex-direction: column;
  font-weight: bold;
}

.filter-button {
  width: 100%;
  background-color: white;
  border: none;
  border-radius: 20px;
  padding: 10px;
  font-weight: bold;
  cursor: pointer;
  text-align: left;
  color: #333; 
  /* Sombra para simular borde despegado */
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.2s ease;
}

.filter-button:hover {
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
  background-color: #f9f9f9;
}

.dropdown {
  position: relative;
  flex: 1; /* Cada filtro toma el mismo espacio */
  min-width: 100px;
  color: #333; 
}

.dropdown-list {
  position: absolute;
  top: 110%;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  list-style: none;
  padding: 5px 0;
  margin: 0;
  z-index: 10;
  width: 100%;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  color: #333; 
  /* Scroll para listas largas como el filtro de Unidad */
  max-height: 250px; 
  overflow-y: auto;
}

.dropdown-list li {
  padding: 8px 16px;
  cursor: pointer;
  color: #333; 
}

.dropdown-list li:hover {
  background-color: #f0f0f0;
  color: #333; 
}

/* Estilo para items seleccionados en multi-select */
.dropdown-list li.selected {
    background-color: #007bff;
    color: white;
    font-weight: bold;
}

.unidad-info-container {
  display: flex;
  flex-direction: column; /* Apila el título y el tiempo de liberación */
  justify-content: center;
}

.unidad-release-time {
  font-size: 12px;
  color: #000; /* Color negro */
  font-weight: bold; /* Texto en negritas */
  margin-top: 4px;
}

/* Solo modificamos un poco el comportamiento del li para manejar mejor el espacio interior */
.unidad-list li {
  padding: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center; /* Alinea verticalmente el icono y el contenedor de textos */
}

/* Ajuste de color para cuando está activo (seleccionado en azul) */
.unidad-list li.active .unidad-release-time {
  color: #f8d7da; /* Color un poco más claro sobre el fondo azul */
}
</style>