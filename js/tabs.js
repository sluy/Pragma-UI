/**
 * Pragma.Libs.Tabs
 * Plugin para manejar contenidos dinámicos con el componente tabs.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-tabs : define el plugin.
 * data-tabs-options="[opciones]"     :   Opciones de configuración via HTML.
 * #-----------------
 * Métodos:
 * #-----------------
 * Tabs.go_to([id])          : Muestra el contenido de la pestaña suministrada.
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.tabs.before_init : Lanzado al inicializar el plugin.
 * pragma.tabs.after_init  : Lanzado al terminar la configuración inicial del plugin.
 * pragma.tabs.changing    : Lanzado inmediatamente después de llamarse al método [go_to()].
 * pragma.tabs.changed     : Evento lanzado al cambiar de contenido y es visible para el usuario.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 * less/tabs.less
 */
$(function (Pragma, $, undefined)
{
	"use strict";
	Pragma.Libs.Tabs = function (element, options)
	{
		var self = this;
		self.$el = element; //Elemento al cual se aplica el Offcanvas
		self.options = options; //Opciones
		self.tabs = {};
		self.active = 0;
		/**
		 * Muestra el contenido de la pestaña
		 * @param  {number} id Id de la pestaña a mostrar.
		 */
		self.go_to = function(id)
		{
			if(self.tabs[id] === undefined || !self.tabs[id].$content || self.tabs[id].$nav.hasClass("disabled") )
			{
				return;
			}
			self.$el.trigger("pragma.tabs.changing");
			$.each(self.tabs,function(k,cfg){
				cfg.$nav.removeClass("active");
				if(cfg.$content)
				{
					cfg.$content.removeClass("active");
				}				
			});
			var speed = self.options.fx_speed;
			if(self.fx)
			{
				speed = 0;
			}
			self.$content.animate({marginLeft: (id-1) *  -self.$wrapper.width()},speed,self.options.fx_easing,function(){
				self.tabs[id].$nav.addClass("active");
				self.tabs[id].$content.addClass("active");
				self.active = parseInt(id);
				self.$el.trigger("pragma.tabs.changed");

				if(self.tabs[id].ajax && (!self.tabs[id].ajax.once || !self.tabs[id].ajax.loaded))
				{
					self.tabs[id].$nav.trigger("pragma.tabs.ajax.loading");

					self.tabs[id].$content.html(self.options.ajax_preload_text).load(
					self.tabs[id].ajax.url,
					function(responseTxt,statusTxt,xhr){
				    self.tabs[id].$nav.trigger({
							type: "pragma.tabs.ajax.complete",
							ajax_status: (statusTxt === "success")?true:false
						});
				    if(statusTxt=="success")
				    {
				    	self.tabs[id].$nav.trigger("pragma.tabs.ajax.success");
				    	self.tabs[id].$content.html(responseTxt);
				    	self.tabs[id].ajax.loaded = true;
				    }
				    if(statusTxt=="error")
				    {
				    	self.tabs[id].$nav.trigger("pragma.tabs.ajax.error");
				    	self.tabs[id].$content.html(self.options.ajax_error_text);
				    }

			  	});
				}
			});
		}
		/**
		 * Configura el tamaño de los contenidos
		 */
		function configure_sizes()
		{
			var width = self.$wrapper.width();
			var count = 0;
			$.each(self.tabs,function(id,cfg){
				if(!cfg.$nav.hasClass("disabled") && cfg.$content){
					cfg.$content.css("width",width);
					count++;
				}
			});
			self.$content.css("width",count*width);
		}
		/**
		 * Configura el plugin
		 */
		function configure()
		{
			self.$el.trigger("pragma.tabs.before_init");
			self.$nav = self.$el.find(".tabs").first();
			self.$content = self.$el.find(".tabs-content").first();
			if(self.$nav.length > 0 && self.$content.length > 0)
			{
				self.$wrapper = $('<div class="tabs-wrapper">').insertBefore(self.$content);
				self.$content.appendTo(self.$wrapper);
				var active = 1;
				self.$content.find("li").each(function(k){
					$(this).attr("data-tab-content-id",(k+1)).removeClass("disabled active");
				});
				self.$nav.find("li").each(function(k){
					if($(this).find("a").length == 1)
					{
						var id = (k+1);
						self.tabs[id] = {
							$nav     : $(this).attr("data-tab-id",id),
							$content : false,
							ajax     : false
						}
						var href = $(this).find("a").attr("href");

						if(href.length > 1 && href[0] == "#" && self.$content.find(href).length > 0)
						{
							self.tabs[id].$content = self.$content.find(href);
						}
						else if(self.$content.find("li[data-tab-content-id='"+id+"']").length > 0)
						{
							self.tabs[id].$content = self.$content.find("li[data-tab-content-id='"+id+"']");
						}

						if(self.tabs[id].$nav.attr("data-ajax") !== undefined)
						{
							self.tabs[id].ajax = {
								url : self.tabs[id].$nav.attr("data-ajax"),
								once : self.tabs[id].$nav.attr("data-ajax-once") !== undefined,
								loaded : false
							}
						}

						if(!self.tabs[id].$content)
						{
							self.tabs[id].$nav.addClass("disabled");
						}

						if(self.tabs[id].$nav.hasClass("active") && !self.tabs[id].$nav.hasClass("disabled"))
						{
							active = id;
						}
						self.tabs[id].$nav.find(" > a").click(function(e){
							e.preventDefault();
							self.go_to($(this).parent().attr("data-tab-id"));
						});
					}
				});
				configure_sizes();
				self.go_to(active);

				$(window).resize(function(e){
					configure_sizes();
					self.go_to(self.active);
				});
			}
			self.$el.trigger("pragma.tabs.after_init");
		}
		//Inicia la configuración
		configure();
	}
	//Versión del plugin
	Pragma.Libs.Sticky.Tabs = "1.0.0";
	//Opciones de configuración
	Pragma.Libs.Tabs.Defaults = {
		fx : true,         //Determina si estará activo o no el efecto de los contenidos.
		fx_speed : 300,    //Velocidad en milisegundos del efecto.
		fx_easing : false, //Efecto easing
		ajax_preload_text : "Cargando...",//Texto de la precarga ajax
		ajax_error_text : 'Contenido no disponible.'//Texto al encontrar error en ajax
	}
	//Inicializa el plugin definido en html al cargar la página.
	$(function ()
	{
		$("[data-pragma-tabs]").each(function ()
		{
			$(this).pragma("tabs");
		});
	});
} (window.Pragma = window.Pragma || {}, jQuery));