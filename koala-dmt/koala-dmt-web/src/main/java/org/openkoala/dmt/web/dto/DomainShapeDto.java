package org.openkoala.dmt.web.dto;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.openkoala.dmt.domain.DomainShape;
import org.openkoala.dmt.domain.DomainsChart;
import org.openkoala.dmt.domain.EntityShape;
import org.openkoala.dmt.domain.EntityType;
import org.openkoala.dmt.domain.EnumShape;
import org.openkoala.dmt.domain.InterfaceShape;
import org.openkoala.dmt.domain.Position;
import org.openkoala.dmt.domain.Property;

public class DomainShapeDto implements Dto {

	private static final long serialVersionUID = -1551254242524216902L;

	private enum ShapeType {
		EntityShape,
		InterfaceShape,
		EnumShape
	}

	private Long id;
	
	private int version;
	
	private ShapeType shapeType;

	private String shapeId;
	
	private Position position;
	
	private Integer width;
	
	private Integer height;
	
	private String name;
	
	private EntityType entityType;
	
	private Set<Property> properties = new HashSet<Property>();

	private List<String> enumItems = new ArrayList<String>();
	
	private String description;
	
	private String parentShapeId;
	
	private Set<String> implementsInterfaceShapeIds = new HashSet<String>();
	
	private Long domainsChartId;
	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public int getVersion() {
		return version;
	}

	public void setVersion(int version) {
		this.version = version;
	}

	public ShapeType getShapeType() {
		return shapeType;
	}

	public void setShapeType(ShapeType shapeType) {
		this.shapeType = shapeType;
	}

	public String getShapeId() {
		return shapeId;
	}

	public void setShapeId(String shapeId) {
		this.shapeId = shapeId;
	}

	public Position getPosition() {
		return position;
	}

	public void setPosition(Position position) {
		this.position = position;
	}

	public Integer getWidth() {
		return width;
	}

	public void setWidth(Integer width) {
		this.width = width;
	}

	public Integer getHeight() {
		return height;
	}

	public void setHeight(Integer height) {
		this.height = height;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public EntityType getEntityType() {
		return entityType;
	}

	public void setEntityType(EntityType entityType) {
		this.entityType = entityType;
	}

	public Set<Property> getProperties() {
		return properties;
	}

	public void setProperties(Set<Property> properties) {
		this.properties = properties;
	}

	public List<String> getEnumItems() {
		return enumItems;
	}

	public void setEnumItems(List<String> enumItems) {
		this.enumItems = enumItems;
	}
	
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getParentShapeId() {
		return parentShapeId;
	}

	public void setParentShapeId(String parentShapeId) {
		this.parentShapeId = parentShapeId;
	}

	public Set<String> getImplementsInterfaceShapeIds() {
		return implementsInterfaceShapeIds;
	}

	public void setImplementsInterfaceShapeIds(
			Set<String> implementsInterfaceShapeIds) {
		this.implementsInterfaceShapeIds = implementsInterfaceShapeIds;
	}

	public Long getDomainsChartId() {
		return domainsChartId;
	}

	public void setDomainsChartId(Long domainsChartId) {
		this.domainsChartId = domainsChartId;
	}

	public DomainShape transformToDomainShape(DomainsChartDto domainsChartDto) {
		if (ShapeType.EntityShape.equals(shapeType)) {
			return generateEntityShape(domainsChartDto);
		}
		
		if (ShapeType.InterfaceShape.equals(shapeType)) {
			return generateInterfaceShape(domainsChartDto);
		}
		
		if (ShapeType.EnumShape.equals(shapeType)) {
			return generateEnumShape(domainsChartDto);
		}
		
		return null;
	}
	
	public EntityShape generateEntityShape(DomainsChartDto domainsChartDto) {
		EntityShape result = new EntityShape();
		setCommonsPropertiesValue(result, domainsChartDto);
		result.setEntityType(entityType);
		result.setProperties(properties);
		result.setImplementsInterfaceShapes(obtainImplementsInterfaceShapes(domainsChartDto));
		
		return result;
	}
	
	private Set<InterfaceShape> obtainImplementsInterfaceShapes(DomainsChartDto domainsChartDto) {
		Set<InterfaceShape> results = new HashSet<InterfaceShape>();
		for (String shapeId : implementsInterfaceShapeIds) {
			DomainShape domainShape = domainsChartDto.getDomainShapeByShapeId(shapeId);
			if (domainShape != null) {
				results.add((InterfaceShape) domainShape);
			}
		}
		return results;
	}
	
	private <T extends DomainShape> T setCommonsPropertiesValue(T domainShape, DomainsChartDto domainsChartDto) {
		domainShape.setId(id);
		domainShape.setVersion(version);
		domainShape.setShapeId(shapeId);
		domainShape.setName(name);
		domainShape.setPosition(position);
		domainShape.setHeight(height);
		domainShape.setWidth(width);
		domainShape.setDescription(description);
		domainShape.setParent(domainsChartDto.getDomainShapeByShapeId(parentShapeId));
//		result.setDomainsChart(generateDomainsChart());
		return domainShape;
	}
	
	public InterfaceShape generateInterfaceShape(DomainsChartDto domainsChartDto) {
		InterfaceShape result = new InterfaceShape();
		setCommonsPropertiesValue(result, domainsChartDto);
		
		return result;
	}
	
	public EnumShape generateEnumShape(DomainsChartDto domainsChartDto) {
		EnumShape result = new EnumShape();
		setCommonsPropertiesValue(result, domainsChartDto);
		result.setEnumItems(enumItems);
		
		return result;
	}
	
	public DomainsChart generateDomainsChart() {
		DomainsChart result = new DomainsChart();
		result.setId(domainsChartId);
		return result;
	}

	public static DomainShapeDto getInstance(DomainShape domainShape) {
		DomainShapeDto result = new DomainShapeDto();
		result.setId(domainShape.getId());
		result.setVersion(domainShape.getVersion());
		result.setName(domainShape.getName());
		result.setShapeId(domainShape.getShapeId());
		result.setPosition(domainShape.getPosition());
		result.setHeight(domainShape.getHeight());
		result.setWidth(domainShape.getWidth());
		result.setDescription(domainShape.getDescription());
		result.setDomainsChartId(domainShape.getDomainsChart().getId());
		
		if (domainShape instanceof EntityShape) {
			EntityShape entityShape = (EntityShape) domainShape;
			result.setShapeType(ShapeType.EntityShape);
			result.setEntityType(entityShape.getEntityType());
			result.setProperties(entityShape.getProperties());
			
			for (InterfaceShape interfaceShape : entityShape.getImplementsInterfaceShapes()) {
				result.getImplementsInterfaceShapeIds().add(interfaceShape.getShapeId());
			}
		}
		
		if (domainShape instanceof InterfaceShape) {
			result.setShapeType(ShapeType.InterfaceShape);
		}
		
		if (domainShape instanceof EnumShape) {
			EnumShape enumShape = (EnumShape) domainShape;
			result.setShapeType(ShapeType.EnumShape);
			result.setEnumItems(enumShape.getEnumItems());
		}
		
		return result;
	}

	@Override
	public boolean equals(final Object other) {
		if (this == other)
			return true;
		if (!(other instanceof DomainShapeDto))
			return false;
		DomainShapeDto castOther = (DomainShapeDto) other;
		return new EqualsBuilder()
				.append(shapeId, castOther.shapeId)
				.append(name, castOther.name)
				.append(domainsChartId, castOther.domainsChartId).isEquals();
	}

	@Override
	public int hashCode() {
		return new HashCodeBuilder(17, 37).append(shapeId).append(name).append(domainsChartId).toHashCode();
	}

}
