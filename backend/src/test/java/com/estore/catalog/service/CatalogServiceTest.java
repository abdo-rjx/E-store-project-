package com.estore.catalog.service;

import com.estore.catalog.dto.ProductDto;
import com.estore.catalog.entity.Category;
import com.estore.catalog.entity.Product;
import com.estore.catalog.repository.CategoryRepository;
import com.estore.catalog.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CatalogServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CatalogService catalogService;

    private Category electronics;
    private Product product1;
    private Product product2;

    @BeforeEach
    void setUp() {
        electronics = Category.builder()
                .id(1L)
                .name("Electronics")
                .description("Electronic devices")
                .build();

        product1 = Product.builder()
                .id(1L)
                .name("iPhone 15")
                .price(999.99)
                .imageUrl("https://placehold.co/300x300")
                .description("Latest iPhone")
                .category(electronics)
                .stock(25)
                .build();

        product2 = Product.builder()
                .id(2L)
                .name("Samsung Galaxy")
                .price(899.99)
                .imageUrl("https://placehold.co/300x300")
                .description("Samsung phone")
                .category(electronics)
                .stock(30)
                .build();
    }

    @Test
    void searchProducts_shouldReturnAll_whenNoFilters() {
        when(productRepository.findAll()).thenReturn(List.of(product1, product2));

        List<ProductDto> result = catalogService.searchProducts(null, null);

        assertThat(result).hasSize(2);
        verify(productRepository).findAll();
    }

    @Test
    void searchProducts_shouldFilterByCategoryOnly_whenOnlyCategoryIdProvided() {
        when(productRepository.findByCategoryId(1L)).thenReturn(List.of(product1, product2));

        List<ProductDto> result = catalogService.searchProducts(null, 1L);

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(p -> p.categoryId().equals(1L));
        verify(productRepository).findByCategoryId(1L);
        verify(productRepository, never()).findByCategoryIdAndNameContainingIgnoreCase(any(), any());
    }

    @Test
    void searchProducts_shouldFilterByKeywordOnly_whenOnlyKeywordProvided() {
        when(productRepository.findByNameContainingIgnoreCase("iphone")).thenReturn(List.of(product1));

        List<ProductDto> result = catalogService.searchProducts("iphone", null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("iPhone 15");
        verify(productRepository).findByNameContainingIgnoreCase("iphone");
    }

    @Test
    void searchProducts_shouldFilterByCategoryAndKeyword_whenBothProvided() {
        when(productRepository.findByCategoryIdAndNameContainingIgnoreCase(1L, "iphone"))
                .thenReturn(List.of(product1));

        List<ProductDto> result = catalogService.searchProducts("iphone", 1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("iPhone 15");
        verify(productRepository).findByCategoryIdAndNameContainingIgnoreCase(1L, "iphone");
    }

    @Test
    void searchProducts_shouldFilterByCategoryOnly_whenKeywordIsBlank() {
        when(productRepository.findByCategoryId(1L)).thenReturn(List.of(product1, product2));

        List<ProductDto> result = catalogService.searchProducts("", 1L);

        assertThat(result).hasSize(2);
        verify(productRepository).findByCategoryId(1L);
        verify(productRepository, never()).findByCategoryIdAndNameContainingIgnoreCase(any(), any());
    }

    @Test
    void searchProductsPaginated_shouldReturnPage_whenNoFilters() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Product> page = new PageImpl<>(List.of(product1, product2), pageable, 2);
        when(productRepository.findAll(pageable)).thenReturn(page);

        var result = catalogService.searchProductsPaginated(null, null, null, pageable);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(2);
        verify(productRepository).findAll(pageable);
    }

    @Test
    void searchProductsPaginated_shouldFilterByCategory_whenOnlyCategoryIdProvided() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Product> page = new PageImpl<>(List.of(product1), pageable, 1);
        when(productRepository.findByCategoryId(1L, pageable)).thenReturn(page);

        var result = catalogService.searchProductsPaginated(null, 1L, null, pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(productRepository).findByCategoryId(1L, pageable);
        verify(productRepository, never()).findByCategoryIdAndNameContainingIgnoreCase(any(), any(), any());
    }

    @Test
    void searchProductsPaginated_shouldFilterByKeywordAndCategory_whenBothProvided() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Product> page = new PageImpl<>(List.of(product1), pageable, 1);
        when(productRepository.findByCategoryIdAndNameContainingIgnoreCase(1L, "iphone", pageable)).thenReturn(page);

        var result = catalogService.searchProductsPaginated("iphone", 1L, null, pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(productRepository).findByCategoryIdAndNameContainingIgnoreCase(1L, "iphone", pageable);
    }

    @Test
    void getProductById_shouldReturnProduct_whenExists() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));

        ProductDto result = catalogService.getProductById(1L);

        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("iPhone 15");
    }

    @Test
    void getProductById_shouldThrowException_whenNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> catalogService.getProductById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Product not found");
    }

    @Test
    void createProduct_shouldSaveProduct() {
        ProductDto request = new ProductDto(null, "New Phone", 599.99, null, "A new phone", null, 1L, 10);
        Product savedProduct = Product.builder()
                .id(10L)
                .name("New Phone")
                .price(599.99)
                .description("A new phone")
                .category(electronics)
                .stock(10)
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(electronics));
        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        ProductDto result = catalogService.createProduct(request);

        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("New Phone");
        assertThat(result.price()).isEqualTo(599.99);
        assertThat(result.stock()).isEqualTo(10);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void deleteProduct_shouldThrowResourceNotFoundException_whenProductDoesNotExist() {
        when(productRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> catalogService.deleteProduct(99L))
                .isInstanceOf(com.estore.shared.exception.ResourceNotFoundException.class)
                .hasMessageContaining("Product not found");
    }

    @Test
    void getAllCategories_shouldReturnCategories() {
        when(categoryRepository.findAll()).thenReturn(List.of(electronics));

        var result = catalogService.getAllCategories();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Electronics");
    }
}
