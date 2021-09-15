;(function($){
	$.fn.umlCanvas = function(opts){
		/*全局变量*/
		var thiz 		= $(this);
		console.log(thiz.selector);
		var zoom		= 1;						//uml图的缩放值
		var easel		= thiz.find(".uml_easel");	//画布容器（画架）
		var svgLines 	= thiz.find(".uml_lines");  //线条容器
		var umlCanvas 	= thiz.find(".uml_canvas");	//所有图形元素的容器
		var toolBar		= thiz.find(".tools");		//切换工具的工具栏
		var focusItem 	= null;						//当前被选中的元素
		var curTool		= {type:"cursor",name:null};//当前的工具（currentTool）
		var focusItem	= null;						//当前被选中的节点或线条
		
		/*全局缓存*/
		var lines 		= {}; 	//页面上的所有线条对象以及所有线条的控制数据(json对象)
		var nodes 		= {}; 	//页面上的所有节点对象以及所有节点的控制数据(json对象)
		var domainModels	= {};	//所有后台业务需要的类
		
		
		
		
		
		/*拖动鼠标画连线*/
		(function(){
			var drawing = false; 				//标志当前状态是否划线状态
			var n1 = n2 = null;		//划线的开始结束节点
			var m1 = m2 = null;		//起点和终点分别对应领域模型
			var startP 	= null;
			var endpoints = null;
			var line;
			var offset;
			
			/*拖动划线*/
			umlCanvas.delegate(".node","mousedown",function(e){
				if(curTool.type != "line" || $(e.target).is(".name") || $(e.target).is(".header") || $(this).is(".illegal")) return;
				offset 		= umlCanvas.offset();
				drawing 	= true;
				startP 		= [e.clientX - offset.left,e.clientY-offset.top];
				line 		= svgGraph.drawLine(startP,[e.clientX - offset.left,e.clientY - offset.top],curTool.name);
				n1 			= $(this);
				
				line.attr("id",commonTool.guid());
				svgLines.append(line);
			})
			
			
			
			
			
			
			
			
			
			.delegate(".node","mouseenter",function(e){ 	//结束节点的获取
				if(curTool.type != "line") return;
				
				var thiz  = $(this),
					tname = curTool.name, 						//toolname
					nodeT = thiz.attr("class").split(" ")[1];	//nodeType
				
				/*连线起点的合法性检查*/
				if(!drawing){
					m1 = thiz.data("domainModel");
					if(tname == "extends") {
						((nodeT == "entity") && (m1.extends == null)) ? //只能继承类，并且只能单继承
							thiz.addClass("legal") : thiz.addClass("illegal");
					} else if(tname == "implement"){
						((nodeT == "entity")) ? //只能有类实现接口
							thiz.addClass("legal") : thiz.addClass("illegal");
					} else if(tname == "compose") {
						
					} else {
						thiz.addClass("illegal");
					}
				}
				
				/*连线终点的合法性检查*/
				if(drawing){
					n2 = $(this);
					m2 = n2.data("domainModel")
					
					if(tname == "extends"){
						(nodeT == "entity") ? 
							thiz.addClass("legal") :	thiz.addClass("illegal");
					} else if(tname == "implement"){
						((nodeT == "interface") && ($.inArray(m2.name, m1.implementsList) < 0)) ? 
							thiz.addClass("legal") : thiz.addClass("illegal");
					} else if(tname == "compose"){
						
					} else {
						thiz.addClass("illegal");
					}
					
					if(!$(this).is(".legal")) n2 = null;
					
					console.log(!$.inArray(m2.name, m1.implementsList));	
				}
			})
			
			
			
			.delegate(".node","mouseleave",function(e){ 	//结束节点的取消
				$(this).removeClass("illegal legal");
				n2 = null;
			})
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			.mousemove(function(e){						//拖动划线效果
				if(drawing){
					e.preventDefault();
					svgGraph.moveLine(line,startP ,[e.clientX - offset.left,e.clientY - offset.top]);
				}
			}).mouseup(function(e){ 	//划线成功效果
				if((drawing && n2 == null)){
					line.remove();
				} else if(n2 != null && drawing){
					//连线的相关逻辑	
					if(line.is(".extends")){
						n1.data("domainModel").extends = n2.find(".name").html();
					} else if(line.is(".implement")){
						m1.implementsList.push(m2.name);
					} else if(line.is(".compose")){
						
					} else if(line.is(".")){
						
					}
					
					endpoints = svgGraph.getStartEnd(n1,n2);
					svgGraph.moveLine(line,endpoints.start ,endpoints.end);
					/*把新增的连线缓存起来*/
					var id = line.attr("id");
					lines[id] = {
						lineObj : line,
						from 	: n1.attr("id"),
						to		: n2.attr("id"),
						type	: 1
					};
				}
				
				line 	= null;
				n2 = null;
				n1 = null;
				drawing = false;
				startP 	= null;
			});
		})();
		
		
		/*拖拽节点，线条联动*/
		(function(){
			var target 			= null;	//被拖动的元素
			var startPosition 	= null;	//被拖动元素开始的位置
			var downPosition 	= null;	//鼠标点击的初始位置
			var relatedLines 	= null;	//与被拖动节点相连的线
			
			/*拖拽节点事件处理函数*/
			var drag = function(e){
				e.preventDefault();
				target.css({
					top : startPosition.top  + e.clientY - downPosition.top  + easel.scrollTop(),
					left: startPosition.left + e.clientX - downPosition.left + easel.scrollLeft()
				});
				/*改变连线*/
				svgGraph.resetLines(target, nodes, lines, relatedLines.outLines, relatedLines.inLines);
			};
			
			umlCanvas.mousedown(function(e) {
				var header = $(e.target);
				
				if(header.is(".name") || header.is(".header")){
					target 			= header.parents(".node");
					startPosition 	= target.position();
					downPosition 	= {left : e.clientX ,top : e.clientY};
					relatedLines 	= commonTool.findRelatedLines(header.parent().attr("id"),lines);
					
					startPosition.top = startPosition.top - easel.scrollTop();
					startPosition.left = startPosition.left - easel.scrollLeft();
					$(this).bind("mousemove",drag);
				}
			}).mouseup(function(){
				$(this).unbind("mousemove",drag);
			});
		})();
		
		
		
		
		/*点击鼠标添加节点*/
		umlCanvas.delegate("svg","click",function(e){
			if(curTool.type == "node"){
				addNode(e);
			}
			
			/*当画布被点击一次时，如果当前不是线条工具，将工具切换回鼠标工具*/
			if(curTool.type == "node"){
				swichTool("cursor");
			}
		});
		
		umlCanvas.contextmenu(function(e){
			var target = $(e.target);
			if(target.is("svg")){
				showContextmenu(target,e,"add_nodes");
			}
		});
		
		/*点击节点，添加属性或行为*/
		umlCanvas.delegate(".node","click",function(e){
			if(curTool.name == "property"){			//添加属性
				addProperty($(this));
			} else if(curTool.name == "action"){ 	//添加行为
				addAction($(this));
			} 
			var relatedLines = commonTool.findRelatedLines($(this).attr("id"),lines);
			svgGraph.resetLines($(this),nodes,lines,relatedLines.outLines,relatedLines.inLines);
			
			swichTool("cursor");
		});
		
		//右键菜单添加领域模型
		$("#add_nodes").delegate(".contextmenu_item","click",function(e){
			var thiz = $(this);
			if(thiz.is(".add_entity")){
				addNode(e,"entity");
			} else if(thiz.is(".add_interface")){
				addNode(e,"interface");
			} else if(thiz.is(".add_enum")){
				addNode(e,"enum");
			}
		});
		
		/*右键菜单添加行为或属性*/
		$("#add_members").delegate(".contextmenu_item","click",function(e){
			var thiz = $(this) ,target = thiz.parent().data("target");
			
			if(thiz.is(".add_property")){
				addProperty(target);
			} else if(thiz.is(".add_action")){
				addAction(target);
			} else if(thiz.is(".add_enumItem")){
				addEnumItem(target);
			}
		});
		
		/*点击工具切换*/
		toolBar.delegate(".cursor,.node,.line,.component","click",function(e){
			swichTool($(this).attr("class").split(" ")[1]);
		});
		
		/** 
		 * 编辑节点名字 
		 */
		umlCanvas.delegate(".name","dblclick",function(e){
			var dmodel = $(this).parent().data("domainModel");
			/*编辑节点名字*/
			$(this).miniedit({
				type:'input',
				afterEdit:function(target,input){
					if(input.val() == ""){
						alert("请输入模型名");
						input.focus();
						return false;
					} else {
						dmodel.name = input.val();
						return true;
					}
				}
			});
		});
		
		function zoom(t){
			var value = $(t).val();
			$(".uml_canvas").css("transform","scale("+value+")");
		}
		/*工具栏切换*/
		toolBar.find(".swich_tool_view").click(function(){
			var thiz = $(this);
			if($(this).data("closed")){
				thiz.data("closed",false);
				thiz.parent().addClass("folder");
			} else {
				thiz.data("closed",true);
				thiz.parent().removeClass("folder");
			}
		});	
		
		/* 双击方式编辑属性或行为 */
		umlCanvas.delegate(".properties,.actions,.name","dblclick",function(e){
			e.preventDefault();
			var thiz = $(this),t=$(e.target);
			var property,action;
			
			var model = t.parents(".node").data("domainModel");
			
			if(thiz.is(".properties")){ 
				property = t.parent().data("property");
			} else if(thiz.is(".actions")){
				action = t.parent().data("action");
			}
			var css = {"font-size":"12px",width:"50%",height:"20px","margin-top":"-1px"};
			if(t.is(".propertyName")){ 		//编辑节点名字
				t.miniedit({ //利用一个行内编辑插件编辑
					type:'input',
					css:css,
					afterEdit:function(target,input){
						if(input.val() == ""){
							alert("请输入属性名");
							input.focus();
							return false;
						} else {
							property.propertyName = input.val(); //同步更新
							console.log(JSON.stringify(model));
							return true;
						}
					}
				});
			} else if(t.is(".propertyType")){ //编辑参数
				t.miniedit({
					type:'input',
					dataList:"property_type_tip",
					css:css,
					afterEdit:function(target,input){
						if(input.val() == ""){
							alert("请输入属性类型");
							input.focus();
							return false;
						} else {
							property.propertyType = input.val();
							console.log(JSON.stringify(model));
							return true;
						}
					}
				});
			} else if(t.is(".actionName")){
				t.miniedit({
					type:'input',
					css:css,
					afterEdit:function(target,input){
						if(input.val() == ""){
							alert("请输入方法名");
							input.focus();
							return false;
						} else {
							action.actionName = input.val();
							return true;
						}
					}
				});
			} else if(t.is(".returnType")){
				t.miniedit({
					type:'input',
					dataList:"property_type_tip",
					css:css,
					afterEdit:function(target,input){
						if(input.val() == ""){
							alert("请输入方法名");
							input.focus();
							return false;
						} else {
							action.returnType = input.val();
							return true;
						}
					}
				});
			}
			
			//TODO:节点尺寸改变，需要重画连线
			
		});
		
		/*右键添加属性或行为或枚举项等等*/
		umlCanvas.delegate(".node","contextmenu",function(e){
			var thiz = $(this);
			var selector;
			
			if(thiz.is(".entity")){ 			//右键实体，添加属性和行为
				selector = "entity";
			} else if(thiz.is(".interface")){ 	//右键接口，添加行为和常量
				selector = "interface";
			} else if(thiz.is(".enum")){ 		//右键枚举，添加枚举项
				selector = "enum";
			}
			
			showContextmenu(thiz,e,"add_members",selector);
		});
		
		/*收起右键菜单*/
		$("body").click(function(){
			$("#edit_contextmenus .contextmenu").slideUp(50);
		});
		
		/*切换工具的方法*/
		function swichTool(name){
			var tool = toolBar.find("."+name);
			var curtool  = tool.attr("class").split(" ");
			
			curTool.type = curtool[0];
			curTool.name = curtool[1];
			
			toolBar.find(".current-tool").removeClass("current-tool");
			tool.addClass("current-tool");
		}
		
		/*显示右键菜单*/
		function showContextmenu(target,e,menuName,selector){
			e.preventDefault();
			$("#edit_contextmenus .contextmenu").slideUp(50);
			var position = commonTool.mousePosition(e);
			
			$("#"+menuName)
			.css({ top : position.top,left : position.left})
			.data("target",target)
			.removeClass(function(index,clazz){
				return clazz.split(" ")[1];
			})
			.addClass(selector)
			.slideDown(50);
		}
		
		/*页面上添加一个节点，对应业务上的一个类或接口*/
		function addNode(e,name){
			var id = commonTool.guid();
			var offset 	= umlCanvas.offset();
			var position = {
					left:e.clientX - offset.left,
					top:e.clientY - offset.top
				};
			var nodeName = name ? name : curTool.name;
			var node = $("#node-template ."+nodeName).clone().css({
					left:position.left,
					top:position.top
				});
			var data = {//节点元素的控制信息
					nodeObj	: node,
					left	: position.left,
					top		: position.top
				};
				
			/*判断要生成那种领域模型*/
			var domainModel = null;
			if(nodeName == "entity"){
				domainModel = new Entity("Entity");
			} else if(nodeName == "interface"){
				domainModel = new Interface("Interface");
			} else if(nodeName == "enum"){
				domainModel = new Enum("Enum");
			}
			
			domainModels[id] = domainModel;						//将节点对应的类保存起来
			nodes[id] = data;									//节点的控制数据（前端用）
			node.attr("id",id).data("domainModel",domainModel); //把对应领域模型缓存在dom节点上，方便查找
			umlCanvas.append(node);
			
			return id;
		}
		
		/**************************************添加节点的各种成员******************************************/
		/*添加属性*/
		function addProperty(target){
			/*TODO:同步添加缓存数据*/
			var dmodel = target.data("domainModel");
			var property = new Property("property1","String");
			var proDom = $("#node-template .property").clone();
			
			dmodel.properties.push(property);
			target.find(".properties").append(proDom);
			/*把对应的属性对象缓存到dom节点上，方便查找*/
			proDom.data("property",property);
		}
		/*添加行为*/
		function addAction(target){
			var dmodel = target.data("domainModel");
			var action = new Action("action","void");
			var actDom = $("#node-template .action").clone();
			
			dmodel.actions.push(action);
			target.find(".actions").append(actDom);
			actDom.data("action",action);
		}
		/*添加枚举项*/
		function addEnumItem(target){
			target.find(".enumItems").append($("#node-template .enumItem").clone());
			/*TODO:同步更新缓存数据*/
			var id = target.attr("id");
			var enumItem = new EnumItem("enum item");
		}
		
		/*更新属性
		 * target：某个类
		 * index是属性的位置
		 * updateItem是属性对象的属性，可能值为name,type,scope
		 */
		function updateProperty(target ,index ,updateItem){
			var id = target.attr("id");
			if(updateItem == "name"){
				
			} else if(updateItem == "type"){
				
			} else if(updateItem == "scope"){
			}
		}
		
		/*删除属性*/
		function deleteProperty(){
			/*TODO:同步更新缓存数据*/
		}
		/*删除行为*/
		function deleteAction(){
			/*TODO:同步更新缓存数据*/
		}
		/*删除枚举项*/
		function deleteEnumItem(){
			/*TODO:同步更新缓存数据*/
		}
	};
})($);