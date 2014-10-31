/**
 * Pragma.Libs.Accordion
 * Plugin para maximizar y minimizar páneles.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-accordion : define el plugin.
 * data-pragma-accordion-options="[opciones]"     : Opciones de configuración via HTML.
 * #-----------------
 * Métodos:
 * #-----------------
 * Accordion.open(id)           : Abre el contenido del panel especificado.
 * Accordion.close(id)          : Cierra el contenido del panel especificado.
 * Accordion.toggle(id)         : Abre o cierra el contenido del panel dependiendo de su estado actual.
 * Accordion.open_all()         : Abre todos los páneles existentes. Este método sólo estará habilitado si la opción
 *                                [multi] está activa.
 * Accordion.close_all()        : Cierra todos los páneles existentes.
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.accordion.before_init : Disparado al inicializar el plugin.
 * pragma.accordion.after_init  : Disparado al terminar la configuración inicial del plugin.
 * pragma.accordion.opening     : Evento disparado inmediatamente después de llamarse el método [open()]. Adicionalmente
 *                                suministra las variables evento.panel_id con el id del panel que se está abriendo
 *                                y evento.panel con las secciones header y body del mismo.
 * pragma.accordion.open        : Evento disparado cuando terminó de ejecutarse el método[open()] y el contenido es visible
															  : para el usuario. Adicionalmente
 *                                suministra las variables evento.panel_id con el id del panel que se abrió
 *                                y evento.panel con las secciones header y body del mismo.
 * pragma.accordion.closing     : Evento disparado inmediatamente después de llamarse el método [close()]. Adicionalmente
 *                                suministra las variables evento.panel_id con el id del panel que se está cerrando
 *                                y evento.panel con las secciones header y body del mismo.
 * pragma.accordion.closed      : Evento disparado cuando terminó de ejecutarse el método[close()] y el contenido ya no es
																	visible para el usuario. Adicionalmente
 *                                suministra las variables evento.panel_id con el id del panel que se cerró
 *                                y evento.panel con las secciones header y body del mismo.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 * less/accordion.less
 * less/panel.less
 * less/mixins/panel.less
 */
$(function (Pragma, $, undefined)
{
	"use strict";
	Pragma.Libs.Accordion = function (element, options)
	{
		var self = this;
		self.$el = element; 
		self.options = options; //Opciones
		/**
		 * Abre el contenido del panel dado.
		 * @param  {number} id Identificador del panel por abrir.
		 */
		self.open = function(id)
		{
			if(self.panels[id] === undefined || self.panels[id].$body.hasClass("open"))
			{
				return;
			}
			self.$el.trigger({
				type        : "pragma.accordion.opening",
				panel_id    : id,
				panel       : self.panels[id]
			});

			if(!self.options.multi)
			{
				self.close_all();
			}

			var speed = Pragma.Utils.get_instance_option(self, "fx_speed", "open");
			var easing = Pragma.Utils.get_instance_option(self, "fx_easing", "open");

			if(!self.options.fx)
			{
				speed = 0;
			}
			self.panels[id].$body.animate({height: "toggle"},speed,easing,function(){
				self.panels[id].$header.find(".caret").first().addClass("up");
				self.panels[id].$body.addClass("open").css("display","block");
				self.$el.trigger({
					type : "pragma.accordion.opening",
					panel_id : id,
					panel       : self.panels[id]
				});
			});
		}
		/**
		 * Cierra el contenido del panel dado.
		 * @param  {number} id Identificador del panel por cerrar.
		 */
		self.close = function(id)
		{
			if(self.panels[id] === undefined && !self.panels[id].$body.hasClass("open"))
			{
				return;
			}
			self.$el.trigger({
				type : "pragma.accordion.closing",
				panel_id : id,
				panel       : self.panels[id]
			});
			var speed = Pragma.Utils.get_instance_option(self, "fx_speed", "close");
			var easing = Pragma.Utils.get_instance_option(self, "fx_easing", "close");
			if(!self.options.fx)
			{
				speed = 0;
			}
			self.panels[id].$body.animate({height: "toggle"},speed,easing,function(){
				self.panels[id].$header.find(".caret.up").first().removeClass("up");
				self.panels[id].$body.removeClass("open").css("display","none");
				self.$el.trigger({
					type : "pragma.accordion.closed",
					panel_id : id,
					panel       : self.panels[id]
				});
			});
		}
		/**
		 * Alterna el estado del contenido del panel. Si está abierto lo cerrará, de lo contrario lo abrirá
		 * @param  {[type]} id Identificador del panel por abrir/cerrar.
		 */
		self.toggle = function(id)
		{
			if(self.panels[id] !== undefined)
			{
				if(self.panels[id].$body.hasClass("open")){
					self.close(id);
				}
				else
				{
					self.open(id);
				}
			}
		}

		/**
		 * Abre el contenido de todos los páneles.
		 * Este método sólo será disponible si la opción [multi] está activada.
		 */
		self.open_all = function()
		{
			if(!self.options.multi)
			{
				return;
			}
			$.each(self.panels,function(id,panel){
				if(panel.$body.hasClass("open"))
				{
					self.close(id);
				}
			});
		}
		/**
		 * Cierra todos los páneles abiertos.
		 */
		self.close_all = function(){
			$.each(self.panels,function(id,panel){
				if(panel.$body.hasClass("open"))
				{
					self.close(id);
				}
			});
		}
		/**
		 * Configura el plugin.
		 */
		function configure()
		{
			self.$el.trigger("pragma.accordion.before_init");
			self.panels = {};
			var active = 0;
			self.$el.find(" > .panel").each(function(k){
				if($(this).find(" > .header").length > 0 && $(this).find(" > .body").length > 0)
				{
					var id = (k+1);
					$(this).attr("data-panel-id",id);
					self.panels[id] = {
						$header : $(this).find(" > .header"),
						$body   : $(this).find(" > .body")
					};
					if(self.options.hover)
					{
						self.panels[id].$header.mouseenter(function(){
							self.open($(this).parent().attr("data-panel-id"));
						});
					}
					else
					{
						self.panels[id].$header.click(function(){
							self.toggle($(this).parent().attr("data-panel-id"));
						});
					}
					if(self.panels[id].$body.hasClass("open"))
					{
						active = id;
						if(self.panels[id].$header.find(".caret").length>0)
						{
							self.panels[id].$header.find(".caret").addClass("up");
						}
					}
				}
			});
			if(!self.options.multi && active > 0)
			{
				$.each(self.panels,function(id,panel){
					panel.$body.removeClass("open");
					panel.$header.find(".caret.up").first().removeClass("up");
				});
				self.panels[active].$body.addClass("open");
				self.panels[active].$header.find(".caret").first().addClass("up");
			}
			self.$el.trigger("pragma.accordion.after_init");
		}
		//Inicia la configuración
		configure();
	}
	//Versión del plugin
	Pragma.Libs.Accordion.Ver = "1.0.0";
	//Opciones de configuración
	Pragma.Libs.Accordion.Defaults = {
		fx : true,         //Determina si estará activo o no la animación de los contenidos.
		fx_speed : 200,    //Velocidad en milisegundos del efecto al abrir y cerrar el contenido.
		fx_easing : false, //Efecto easing de la animación al abrir y cerrar el contenido.
		open_fx_speed : "inherit", //Velocidad en milisegundos de la animación al abrir el contenido.
		close_fx_speed : "inherit", //Velocidad en milisegundos de la animación al cerrar el contenido.
		open_fx_easing : "inherit", //Efecto easing de la animación al abrir el contenido.
		close_fx_easing : "inherit",//Efecto easing de la animación al cerrar el contenido.
		multi : false,      //Determina si pueden haber abiertos varios páneles a la vez.
		hover : false       //Determina si se abrirán los páneles al pasar el puntero del ratón.
	}
	//Inicializa el plugin definido en html al cargar la página.
	$(function ()
	{
		$("[data-pragma-accordion]").each(function ()
		{
			$(this).pragma("accordion");
		});
	});
} (window.Pragma = window.Pragma || {}, jQuery));