import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';

const API_URL = 'https://jsonplaceholder.typicode.com/users';

const CustomCheckbox = ({checked, onPress}) => (
  <TouchableOpacity onPress={onPress} style={styles.checkbox}>
    <View style={[styles.checkboxInner, checked && styles.checkboxChecked]}>
      {checked && <Text style={styles.checkmark}>✓</Text>}
    </View>
  </TouchableOpacity>
);

const DataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('ascending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      const jsonData = await response.json();

      const transformedData = jsonData.map(user => ({
        id: user.id,
        name: user.name,
        age: Math.floor(Math.random() * 40) + 20,
        dob: generateRandomDob(),
        checked: false,
      }));

      setData(transformedData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  const generateRandomDob = () => {
    const year = Math.floor(Math.random() * 30) + 1970;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    return `${day.toString().padStart(2, '0')}/${month
      .toString()
      .padStart(2, '0')}/${year}`;
  };

  const getProcessedData = () => {
    let processed = [...data];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      processed = processed.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.age.toString().includes(query) ||
          item.dob.includes(query),
      );
    }

    if (sortKey) {
      processed.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) {
          return sortDirection === 'ascending' ? -1 : 1;
        }
        if (a[sortKey] > b[sortKey]) {
          return sortDirection === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return processed;
  };

  const handleSort = key => {
    if (sortKey === key) {
      setSortDirection(
        sortDirection === 'ascending' ? 'descending' : 'ascending',
      );
    } else {
      setSortKey(key);
      setSortDirection('ascending');
    }
  };

  const handleCheckboxToggle = id => {
    setData(
      data.map(item =>
        item.id === id ? {...item, checked: !item.checked} : item,
      ),
    );
  };

  const getSortIndicator = key => {
    if (sortKey !== key) return null;
    return (
      <Text style={styles.sortIndicator}>
        {sortDirection === 'ascending' ? '▲' : '▼'}
      </Text>
    );
  };

  const renderItem = ({item}) => (
    <View style={styles.row}>
      <Text style={styles.cellText}>{item.name}</Text>
      <Text style={styles.cellText}>{item.age}</Text>
      <Text style={styles.cellText}>{item.dob}</Text>
      <View style={styles.cellCenter}>
        <CustomCheckbox
          checked={item.checked}
          onPress={() => handleCheckboxToggle(item.id)}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>User Data Table</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search across all columns..."
        placeholderTextColor="#777"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.tableContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerCell}
            onPress={() => handleSort('name')}>
            <Text style={styles.headerText}>
              Name {getSortIndicator('name')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerCell}
            onPress={() => handleSort('age')}>
            <Text style={styles.headerText}>Age {getSortIndicator('age')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerCell}
            onPress={() => handleSort('dob')}>
            <Text style={styles.headerText}>DOB {getSortIndicator('dob')}</Text>
          </TouchableOpacity>

          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Select</Text>
          </View>
        </View>

        <FlatList
          data={getProcessedData()}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyText}>No matching records found</Text>
            </View>
          }
          initialNumToRender={10}
          style={styles.flatList}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#4ECDC4',
  },
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
  },
  flatList: {
    flex: 1,
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#252525',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#252525',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerCell: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#4ECDC4',
    textAlign: 'center',
  },
  sortIndicator: {
    color: '#4ECDC4',
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cellText: {
    flex: 1,
    padding: 12,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  cellCenter: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFFFFF',
  },
  emptyList: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
  },
  checkbox: {
    height: 24,
    width: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxInner: {
    height: 16,
    width: 16,
    borderRadius: 2,
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4ECDC4',
  },
  checkmark: {
    color: '#121212',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default DataTable;
